// ============================================
// DRAW ENGINE — Core Logic
// ============================================

// RANDOM DRAW — pure lottery style
export function generateRandomDraw() {
  const numbers = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers.sort((a, b) => a - b)
}

// ALGORITHMIC DRAW — weighted by score frequency
export function generateAlgorithmicDraw(allUserScores) {
  if (!allUserScores || allUserScores.length === 0) {
    return generateRandomDraw()
  }

  // Count frequency of each score
  const frequency = {}
  allUserScores.forEach(score => {
    frequency[score] = (frequency[score] || 0) + 1
  })

  // Build weighted pool
  // More frequent scores = higher chance of being drawn
  const weightedPool = []
  Object.entries(frequency).forEach(([score, count]) => {
    for (let i = 0; i < count; i++) {
      weightedPool.push(parseInt(score))
    }
  })

  // Shuffle the pool
  for (let i = weightedPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]]
  }

  // Pick 5 unique numbers
  const numbers = []
  for (const num of weightedPool) {
    if (!numbers.includes(num) && numbers.length < 5) {
      numbers.push(num)
    }
  }

  // Fill remaining with random if needed
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) numbers.push(num)
  }

  return numbers.sort((a, b) => a - b)
}

// CHECK HOW MANY NUMBERS A USER MATCHED
export function checkMatches(drawNumbers, userScores) {
  if (!userScores || userScores.length === 0) return 0
  return drawNumbers.filter(num => userScores.includes(num)).length
}

// CALCULATE PRIZE POOLS
export function calculatePrizePools(totalPool, jackpotRollover = 0) {
  const jackpot = (totalPool * 0.40) + jackpotRollover
  const pool4 = totalPool * 0.35
  const pool3 = totalPool * 0.25

  return {
    jackpot: parseFloat(jackpot.toFixed(2)),
    pool4match: parseFloat(pool4.toFixed(2)),
    pool3match: parseFloat(pool3.toFixed(2)),
  }
}

// CALCULATE PRIZE PER WINNER
export function calculatePrizePerWinner(poolAmount, winnerCount) {
  if (winnerCount === 0) return 0
  return parseFloat((poolAmount / winnerCount).toFixed(2))
}

// SIMULATE DRAW RESULTS (preview before publishing)
export function simulateDraw(drawNumbers, allEntries) {
  const results = {
    match5: [],
    match4: [],
    match3: [],
    noMatch: [],
  }

  allEntries.forEach(entry => {
    const matched = checkMatches(drawNumbers, entry.scores)
    if (matched === 5) results.match5.push(entry)
    else if (matched === 4) results.match4.push(entry)
    else if (matched === 3) results.match3.push(entry)
    else results.noMatch.push(entry)
  })

  return results
}