export const LEADERBOARD_QUIZ_TYPE = "leaderboard_quiz";

export const LEADERBOARD_QUIZ_DEFAULT_RULES = {
  normalQuestionPoints: 10,
  goldenEvery: 5,
  goldenQuestionPoints: 30,
  rewardedAdMultiplier: 2,
  pageSize: 100,
  firstPrize: 10000,
  secondPrize: 5000,
  thirdPrize: 3000,
  fourthTenthPrize: 2000,
};

export const LEADERBOARD_QUIZ_DEFAULT_INSTRUCTIONS = [
  "Each correct normal question gives 10 points",
  "Every 5th question is golden",
  "Golden questions are worth 30 points",
  "Watch an ad before answering a golden question to double its points",
  "Leaderboard depends on event points only",
  "Top 10 players win prizes",
];
