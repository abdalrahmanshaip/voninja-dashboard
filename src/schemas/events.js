import { z } from 'zod'

export function getEventSchema(activeTab, basicSubType) {
  return z
    .object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      imageUrl: z
        .union([z.instanceof(File), z.string().url(), z.string().length(0)])
        .optional(),
      ...(!(activeTab == 'basic' && basicSubType == 'welcome') && {
        startAt: z.coerce
          .date()
          .min(new Date(), { message: 'Start date must be in the future' }),
        endAt: z.coerce.date(),
      }),
      type: z.enum(['multiplier', 'quiz', 'welcome', 'target_points']),
      rules: z
        .object({
          ...(activeTab === 'double' && {
            multiplier: z.number().min(1, 'Multiplier must be at least 1'),
          }),
          ...(activeTab === 'challenge' && {
            quizMinCorrect: z.number().min(1, 'Minimum correct answers is required'),
            quizReward: z.number().min(1, 'Reward is required'),
            quizTotal: z.number()
          }),
          ...(activeTab === 'basic' &&
            basicSubType === 'target_points' && {
              targetGoal: z
                .number()
                .int()
                .min(1, 'Target goal must be at least 1'),
              targetReward: z
                .number()
                .int()
                .min(1, 'Target reward is required'),
            }),
          ...(activeTab === 'basic' &&
            basicSubType === 'welcome' && {
              welcomeGoal: z
                .number()
                .int()
                .min(1, 'Welcome goints must be at least 1'),
              welcomeReward: z
                .number()
                .int()
                .min(1, 'Welcome reward is required'),
            }),
        })
        .optional(),
    })
    .refine(
      (data) =>
        data.startAt && data.endAt
          ? data.endAt > data.startAt
          : true,
      {
        message: 'End date must be after start date',
        path: ['endAt'],
      }
    )
}
