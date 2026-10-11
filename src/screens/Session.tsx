import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardView, TYPE_LABEL } from '../components/CardView';
import { RuleSheet } from '../components/RuleSheet';
import { fullAnswer } from '../components/text';
import { cardsWord } from '../plural';
import { go } from '../router';
import { buildDeck, shuffle, type Source } from '../session';
import type { Lang, SessionCard } from '../types';

interface Props {
  lang: Lang;
  source: Source;
  limit: number;
}

const SWIPE = 70;

export function Session({ lang, source, limit }: Props) {
  const [queue, setQueue] = useState<SessionCard[]>(() => buildDeck(lang, source, limit));
  const [total, setTotal] = useState(queue.length);
  const [done, setDone] = useState(0);
  const [missed, setMissed] = useState<Map<string, SessionCard>>(new Map());
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string>();
  const [showRule, setShowRule] = useState(false);
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);

  const current = queue[0];
  const isChoice = current?.card.type === 'choice';
  // Порядок вариантов перемешивается, чтобы верный не стоял всегда слева.
  const options = useMemo(() => shuffle(current?.card.options ?? []), [current]);

  const start = (deck: SessionCard[]) => {
    setQueue(deck);
    setTotal(deck.length);
    setDone(0);
    setMissed(new Map());
    setRevealed(false);
    setPicked(undefined);
  };

  // «Знаю» убирает карточку, «Ещё раз» возвращает её через 3–5 карточек.
  // Прогресс между сессиями не хранится — это зубрёжка здесь и сейчас.
  const grade = useCallback(
    (known: boolean) => {
      if (!current) return;
      const rest = queue.slice(1);
      if (known) {
        setQueue(rest);
        setDone((d) => d + 1);
      } else {
        const at = Math.min(rest.length, 3 + Math.floor(Math.random() * 3));
        setQueue([...rest.slice(0, at), current, ...rest.slice(at)]);
        setMissed((m) => new Map(m).set(current.key, current));
      }
      setRevealed(false);
      setPicked(undefined);
      setDx(0);
    },
    [current, queue],
  );

  const pick = (option: string) => {
    if (picked !== undefined) return;
    setPicked(option);
    setRevealed(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || showRule) return;
      if (!revealed && !isChoice && (e.key === ' ' || e.key === 'Enter')) setRevealed(true);
      else if (revealed && isChoice && (e.key === ' ' || e.key === 'Enter')) grade(picked === current.card.answer);
      else if (revealed && !isChoice && e.key === 'ArrowRight') grade(true);
      else if (revealed && !isChoice && e.key === 'ArrowLeft') grade(false);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, revealed, isChoice, picked, grade, showRule]);

  const exit = () => go(`/${lang}`);

  if (!current) {
    if (total === 0) {
      return (
        <div className="screen">
          <header className="topbar">
            <button className="icon-btn" onClick={exit} aria-label="Назад">
              ←
            </button>
          </header>
          <div className="empty">Здесь пока нет карточек.</div>
        </div>
      );
    }
    const missedList = [...missed.values()];
    return (
      <div className="screen">
        <header className="topbar">
          <button className="icon-btn" onClick={exit} aria-label="Назад">
            ←
          </button>
        </header>
        <main className="finish">
          <h1>Готово</h1>
          <p className="muted">
            {cardsWord(total)} · {missedList.length ? `ошибся в ${missedList.length}` : 'всё с первого раза'}
          </p>
          {missedList.length > 0 && (
            <ul className="missed">
              {missedList.map(({ key, card }) => (
                <li key={key}>
                  <span className="native">{card.prompt}</span>
                  <span className="target">{fullAnswer(card)}</span>
                </li>
              ))}
            </ul>
          )}
        </main>
        <footer className="actions actions-stack">
          {missedList.length > 0 && (
            <button className="btn btn-primary" onClick={() => start(shuffle(missedList))}>
              Прогнать ошибки ещё раз
            </button>
          )}
          <button className="btn" onClick={() => start(buildDeck(lang, source, limit))}>
            Новый круг
          </button>
          <button className="btn btn-ghost" onClick={exit}>
            Хватит на сегодня
          </button>
        </footer>
      </div>
    );
  }

  const { card, lesson, rule } = current;
  const swipeable = revealed && !isChoice;

  return (
    <div className="screen session">
      <header className="topbar">
        <button className="icon-btn" onClick={exit} aria-label="Выйти">
          ←
        </button>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="counter">
          {done}/{total}
        </span>
      </header>

      <main
        className={`card ${swipeable && dx > SWIPE ? 'card-know' : ''} ${swipeable && dx < -SWIPE ? 'card-again' : ''}`}
        style={{ transform: dx ? `translateX(${dx}px) rotate(${dx / 30}deg)` : undefined }}
        onClick={() => !isChoice && !revealed && setRevealed(true)}
        onPointerDown={(e) => {
          if (!swipeable || (e.target as HTMLElement).closest('button')) return;
          startX.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => startX.current !== null && setDx(e.clientX - startX.current)}
        onPointerUp={() => {
          if (startX.current === null) return;
          startX.current = null;
          if (dx > SWIPE) grade(true);
          else if (dx < -SWIPE) grade(false);
          else setDx(0);
        }}
        onPointerCancel={() => {
          startX.current = null;
          setDx(0);
        }}
      >
        <div className="card-meta">
          <span className="chip">{TYPE_LABEL[card.type]}</span>
          <span className="muted lesson-name">{lesson.title}</span>
          {rule && (
            <button
              className="rule-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowRule(true);
              }}
              aria-label="Правило"
            >
              ?
            </button>
          )}
        </div>
        <CardView card={card} revealed={revealed} picked={picked} />
        {!revealed && !isChoice && <p className="hint">тапни, чтобы проверить</p>}
      </main>

      <footer className="actions">
        {isChoice && !revealed &&
          options.map((option) => (
            <button key={option} className="btn btn-option" onClick={() => pick(option)}>
              {option}
            </button>
          ))}
        {isChoice && revealed && (
          <button
            className={`btn btn-wide ${picked === card.answer ? 'btn-know' : 'btn-again'}`}
            onClick={() => grade(picked === card.answer)}
          >
            {picked === card.answer ? 'Верно · дальше' : 'Запомню · дальше'}
          </button>
        )}
        {!isChoice && !revealed && (
          <button className="btn btn-wide" onClick={() => setRevealed(true)}>
            Показать ответ
          </button>
        )}
        {!isChoice && revealed && (
          <>
            <button className="btn btn-again" onClick={() => grade(false)}>
              Ещё раз
            </button>
            <button className="btn btn-know" onClick={() => grade(true)}>
              Знаю
            </button>
          </>
        )}
      </footer>

      {showRule && rule && <RuleSheet rule={rule} onClose={() => setShowRule(false)} />}
    </div>
  );
}
