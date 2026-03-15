import { z } from "zod";
import {
  LEADERBOARD_QUIZ_DEFAULT_RULES,
  LEADERBOARD_QUIZ_TYPE,
} from "./leaderboardQuiz";

export function getEventSchema(activeTab, basicSubType) {
  return z
    .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      imageUrl: z
        .union([z.instanceof(File), z.string().url(), z.string().length(0)])
        .optional(),
      ...(!(activeTab == "basic" && basicSubType == "welcome") && {
        startAt: z.coerce
          .date()
          .min(new Date(), { message: "Start date must be in the future" }),
        endAt: z.coerce.date(),
      }),
      type: z.enum([
        "multiplier",
        "quiz",
        "welcome",
        "target_points",
        LEADERBOARD_QUIZ_TYPE,
      ]),
      rules: z
        .object({
          ...(activeTab === "double" && {
            multiplier: z.number().min(1, "Multiplier must be at least 1"),
          }),
          ...(activeTab === "challenge" && {
            quizMinCorrect: z
              .number()
              .min(1, "Minimum correct answers is required"),
            quizReward: z.number().min(1, "Reward is required"),
            quizTotal: z.number().default(0),
          }),
          ...(activeTab === "leaderboard" && {
            normalQuestionPoints: z
              .number()
              .int()
              .min(1, "Normal question points must be at least 1"),
            goldenEvery: z
              .number()
              .int()
              .min(1, "Golden question frequency must be at least 1"),
            goldenQuestionPoints: z
              .number()
              .int()
              .min(1, "Golden question points must be at least 1"),
            rewardedAdMultiplier: z
              .number()
              .int()
              .min(1, "Ad multiplier must be at least 1"),
            pageSize: z.number().int().min(1, "Page size must be at least 1"),
            firstPrize: z.number().int().min(0, "First prize must be positive"),
            secondThirdPrize: z
              .number()
              .int()
              .min(0, "Second/Third prize must be positive"),
            fourthTenthPrize: z
              .number()
              .int()
              .min(0, "Fourth-Tenth prize must be positive"),
          }),
          ...(activeTab === "basic" &&
            basicSubType === "target_points" && {
              targetGoal: z
                .number()
                .int()
                .min(1, "Target goal must be at least 1"),
              targetReward: z
                .number()
                .int()
                .min(1, "Target reward is required"),
            }),
          ...(activeTab === "basic" &&
            basicSubType === "welcome" && {
              welcomeGoal: z
                .number()
                .int()
                .min(1, "Welcome goints must be at least 1"),
              welcomeReward: z
                .number()
                .int()
                .min(1, "Welcome reward is required"),
            }),
        })
        .optional(),
      instructions:
        activeTab === "leaderboard"
          ? z
              .array(z.string().min(1, "Instruction cannot be empty"))
              .min(1, "At least one instruction is required")
          : z.array(z.string()).optional(),
    })
    .transform((data) => {
      if (data.type !== LEADERBOARD_QUIZ_TYPE) {
        return data;
      }

      return {
        ...data,
        rules: {
          ...LEADERBOARD_QUIZ_DEFAULT_RULES,
          ...(data.rules || {}),
        },
      };
    })
    .refine(
      (data) => (data.startAt && data.endAt ? data.endAt > data.startAt : true),
      {
        message: "End date must be after start date",
        path: ["endAt"],
      },
    );
}
