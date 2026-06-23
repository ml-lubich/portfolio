export type HDStatus = "idle" | "running" | "paused" | "lost" | "won"
export type CardState = "active" | "correct" | "wrong" | "expired"

export interface HDCard {
  id: string
  text: string
  isHallucination: boolean
  timeLeft: number
  maxTime: number
  state: CardState
  slot: number
  feedbackTimer: number
}

export interface HDState {
  status: HDStatus
  cards: readonly HDCard[]
  score: number
  lives: number
  wave: number
  tick: number
  spawnTimer: number
  waveSpawned: number
  waveTotal: number
  waveHalls: number
  waveQueue: readonly boolean[]
}

const REAL_FACTS = [
  "GPT stands for Generative Pre-trained Transformer",
  "BERT was released by Google in 2018",
  "Transformers use self-attention mechanisms",
  "Claude is made by Anthropic",
  "The Attention paper was published in 2017",
  "ChatGPT launched in November 2022",
  "Embeddings represent text as dense vectors",
  "RAG stands for Retrieval Augmented Generation",
  "LLMs are trained using next-token prediction",
  "Temperature controls output randomness",
  "Tokens are sub-word units of text",
  "RLHF: Reinforcement Learning from Human Feedback",
  "GPT-4 is a multimodal model",
  "Fine-tuning adjusts pre-trained model weights",
  "Context windows limit how much text LLMs process",
  "Attention complexity is O(n²) in sequence length",
]

const HALLUCINATED_FACTS = [
  "GPT-4 was released in January 2019",
  "Claude was made by OpenAI",
  "LLMs work by searching an indexed database",
  "Temperature=0 produces random outputs",
  "GPT-3 has 175 million parameters",
  "The Transformer was invented at Facebook",
  "ChatGPT launched in January 2020",
  "BERT is autoregressive like GPT",
  "RAG completely eliminates hallucinations",
  "Anthropic was founded by Elon Musk",
  "Attention mechanism is O(n) complexity",
  "Fine-tuning always improves model performance",
  "Claude 3 was released in 2019",
  "Embeddings are stored in SQL databases by default",
  "RLHF stands for Recursive Learning from Human Feedback",
]

function getWaveConfig(wave: number) {
  const waveTotal = Math.min(8 + wave * 2, 20)
  const waveHalls = Math.floor(waveTotal * 0.4)
  const cardDuration = Math.max(120, 300 - wave * 20)
  const spawnInterval = Math.max(60, 120 - wave * 10)
  return { waveTotal, waveHalls, cardDuration, spawnInterval }
}

function buildWaveQueue(total: number, halls: number, rng: () => number): boolean[] {
  const queue = Array.from({ length: total }, (_, i) => i < halls)
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]]
  }
  return queue
}

export function createHDState(): HDState {
  return {
    status: "idle",
    cards: [],
    score: 0,
    lives: 3,
    wave: 1,
    tick: 0,
    spawnTimer: 0,
    waveSpawned: 0,
    waveTotal: 0,
    waveHalls: 0,
    waveQueue: [],
  }
}

export function startHD(state: HDState): HDState {
  const cfg = getWaveConfig(1)
  const queue = buildWaveQueue(cfg.waveTotal, cfg.waveHalls, Math.random)
  return {
    ...createHDState(),
    status: "running",
    wave: 1,
    spawnTimer: 0,
    waveTotal: cfg.waveTotal,
    waveHalls: cfg.waveHalls,
    waveQueue: queue,
  }
}

export function pauseHD(state: HDState): HDState {
  if (state.status === "running") return { ...state, status: "paused" }
  if (state.status === "paused") return { ...state, status: "running" }
  return state
}

function applyFeedback(card: HDCard, newState: CardState): HDCard {
  return { ...card, state: newState, feedbackTimer: 60, timeLeft: 60 }
}

export function clickCard(state: HDState, cardId: string): HDState {
  const card = state.cards.find(c => c.id === cardId && c.state === "active")
  if (!card) return state
  const updated = applyFeedback(card, card.isHallucination ? "correct" : "wrong")
  const scoreDelta = card.isHallucination ? 10 + state.wave * 5 : 0
  const newLives = card.isHallucination ? state.lives : state.lives - 1
  const newCards = state.cards.map(c => c.id === cardId ? updated : c)
  const newStatus = newLives <= 0 ? "lost" : state.status
  return { ...state, cards: newCards, score: state.score + scoreDelta, lives: newLives, status: newStatus }
}

function tickCards(cards: readonly HDCard[]): { cards: HDCard[]; livesLost: number } {
  let livesLost = 0
  const next = cards.map(card => {
    if (card.state !== "active") {
      const ft = card.feedbackTimer - 1
      return { ...card, feedbackTimer: ft }
    }
    const tl = card.timeLeft - 1
    if (tl <= 0 && card.isHallucination) {
      livesLost++
      return { ...card, state: "expired" as CardState, timeLeft: 0, feedbackTimer: 60 }
    }
    if (tl <= 0) {
      return { ...card, state: "expired" as CardState, timeLeft: 0, feedbackTimer: 60 }
    }
    return { ...card, timeLeft: tl }
  })
  return { cards: next, livesLost }
}

function pruneCards(cards: HDCard[]): HDCard[] {
  return cards.filter(c => c.state === "active" || c.feedbackTimer > 0)
}

function occupiedSlots(cards: readonly HDCard[]): Set<number> {
  return new Set(cards.map(c => c.slot))
}

function pickFreeSlot(occupied: Set<number>, rng: () => number): number {
  const free = Array.from({ length: 12 }, (_, i) => i).filter(s => !occupied.has(s))
  if (free.length === 0) return -1
  return free[Math.floor(rng() * free.length)]
}

function pickFact(isHall: boolean, rng: () => number): string {
  const pool = isHall ? HALLUCINATED_FACTS : REAL_FACTS
  return pool[Math.floor(rng() * pool.length)]
}

function spawnCard(state: HDState, rng: () => number): HDState {
  const activeCount = state.cards.filter(c => c.state === "active").length
  if (activeCount >= 6) return state
  if (state.waveSpawned >= state.waveTotal) return state
  if (state.waveQueue.length === 0) return state

  const [isHall, ...restQueue] = state.waveQueue
  const occupied = occupiedSlots(state.cards)
  const slot = pickFreeSlot(occupied, rng)
  if (slot === -1) return state

  const cfg = getWaveConfig(state.wave)
  const card: HDCard = {
    id: `${state.tick}-${slot}`,
    text: pickFact(isHall, rng),
    isHallucination: isHall,
    timeLeft: cfg.cardDuration,
    maxTime: cfg.cardDuration,
    state: "active",
    slot,
    feedbackTimer: 0,
  }
  const cfg2 = getWaveConfig(state.wave)
  return {
    ...state,
    cards: [...state.cards, card],
    waveSpawned: state.waveSpawned + 1,
    waveQueue: restQueue,
    spawnTimer: cfg2.spawnInterval,
  }
}

function advanceWave(state: HDState, rng: () => number): HDState {
  const nextWave = state.wave + 1
  if (nextWave > 5) return { ...state, status: "won" }
  const cfg = getWaveConfig(nextWave)
  const queue = buildWaveQueue(cfg.waveTotal, cfg.waveHalls, rng)
  return {
    ...state,
    wave: nextWave,
    cards: [],
    waveSpawned: 0,
    waveTotal: cfg.waveTotal,
    waveHalls: cfg.waveHalls,
    waveQueue: queue,
    spawnTimer: cfg.spawnInterval,
  }
}

export function tickHD(state: HDState, rng: () => number): HDState {
  if (state.status !== "running") return state

  const { cards: ticked, livesLost } = tickCards(state.cards)
  const pruned = pruneCards(ticked)
  const newLives = state.lives - livesLost
  if (newLives <= 0) {
    return { ...state, cards: pruned, lives: 0, status: "lost", tick: state.tick + 1 }
  }

  let next: HDState = { ...state, cards: pruned, lives: newLives, tick: state.tick + 1, spawnTimer: state.spawnTimer - 1 }

  const waveComplete = next.waveSpawned >= next.waveTotal && next.cards.length === 0
  if (waveComplete) return advanceWave(next, rng)

  if (next.spawnTimer <= 0) next = spawnCard(next, rng)

  return next
}
