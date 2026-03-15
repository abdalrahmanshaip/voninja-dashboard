import { Upload } from "lucide-react";
import PropTypes from "prop-types";
import { useFieldArray } from "react-hook-form";
import { useCreateEvent } from "../../hooks/useCreateEvent";
import LoadingSpinner from "../common/LoadingSpinner";

const SharedEventForm = ({ event, activeTab, onClose }) => {
  const basicSubType = event ? event.type : "target_points";

  const {
    control,
    errors,
    handleSubmit,
    onSubmit,
    register,
    setValue,
    watch,
    isSubmitting,
  } = useCreateEvent(activeTab, basicSubType, event, onClose);

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: "instructions",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-1 gap-4">
          <div className="w-full">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              type="text"
              id="title"
              name="title"
              className={`mt-1 input ${errors.title ? "border-red-500" : ""}`}
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="1"
              className={`mt-1 input min-h-[38px] ${
                errors.description ? "border-red-500" : ""
              }`}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {!(activeTab == "basic" && basicSubType == "welcome") && (
          <div className="flex flex-1 gap-4">
            <div className="w-full">
              <label
                htmlFor="startAt"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="datetime-local"
                id="startAt"
                name="startAt"
                className={`mt-1 input ${
                  errors.startAt ? "border-red-500" : ""
                }`}
                {...register("startAt", { valueAsDate: true })}
              />
              {errors.startAt && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startAt.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="endAt"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                type="datetime-local"
                id="endAt"
                name="endAt"
                className={`mt-1 input ${errors.endAt ? "border-red-500" : ""}`}
                {...register("endAt", { valueAsDate: true })}
              />
              {errors.endAt && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endAt.message}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "double" && (
          <div>
            <label
              htmlFor="multiplier"
              className="block text-sm font-medium text-gray-700"
            >
              Points Multiplier
            </label>
            <input
              id="multiplier"
              type="number"
              min="1"
              minLength={1}
              className={`mt-1 input ${
                errors.rules?.multiplier ? "border-red-500" : ""
              }`}
              {...register("rules.multiplier", { valueAsNumber: true })}
            />

            {errors.rules?.multiplier && (
              <p className="mt-1 text-sm text-red-600">
                {errors.rules.multiplier.message}
              </p>
            )}
          </div>
        )}

        {activeTab === "challenge" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Correct Answers
              </label>
              <input
                name="rules.quizMinCorrect"
                type="number"
                min="1"
                className="mt-1 input"
                {...register("rules.quizMinCorrect", { valueAsNumber: true })}
              />
              {errors.rules?.quizMinCorrect && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rules.quizMinCorrect.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reward Points
              </label>
              <input
                name="rules.quizReward"
                type="number"
                min="1"
                className="mt-1 input"
                {...register("rules.quizReward", { valueAsNumber: true })}
              />
              {errors.rules?.quizReward && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rules.quizReward.message}
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === "leaderboard" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Normal Question Points
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 input"
                  {...register("rules.normalQuestionPoints", {
                    valueAsNumber: true,
                  })}
                />
                {errors.rules?.normalQuestionPoints && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.normalQuestionPoints.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Golden Every (questions)
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 input"
                  {...register("rules.goldenEvery", { valueAsNumber: true })}
                />
                {errors.rules?.goldenEvery && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.goldenEvery.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Golden Question Points
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 input"
                  {...register("rules.goldenQuestionPoints", {
                    valueAsNumber: true,
                  })}
                />
                {errors.rules?.goldenQuestionPoints && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.goldenQuestionPoints.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rewarded Ad Multiplier
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 input"
                  {...register("rules.rewardedAdMultiplier", {
                    valueAsNumber: true,
                  })}
                />
                {errors.rules?.rewardedAdMultiplier && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.rewardedAdMultiplier.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Page Size
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 input"
                  {...register("rules.pageSize", { valueAsNumber: true })}
                />
                {errors.rules?.pageSize && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.pageSize.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Prize
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 input"
                  {...register("rules.firstPrize", { valueAsNumber: true })}
                />
                {errors.rules?.firstPrize && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.firstPrize.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Second/Third Prize
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 input"
                  {...register("rules.secondThirdPrize", {
                    valueAsNumber: true,
                  })}
                />
                {errors.rules?.secondThirdPrize && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.secondThirdPrize.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fourth-Tenth Prize
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 input"
                  {...register("rules.fourthTenthPrize", {
                    valueAsNumber: true,
                  })}
                />
                {errors.rules?.fourthTenthPrize && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rules.fourthTenthPrize.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instructions
              </label>
              <div className="space-y-2 mt-1">
                {instructionFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Instruction ${index + 1}`}
                      className={`input w-full ${
                        errors.instructions?.[index] ? "border-red-500" : ""
                      }`}
                      {...register(`instructions.${index}`)}
                    />
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="btn btn-ghost"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={() => appendInstruction("")}
              >
                Add Instruction
              </button>

              {errors.instructions?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.instructions.message}
                </p>
              )}

              {instructionFields.map(
                (_, index) =>
                  errors.instructions?.[index]?.message && (
                    <p key={index} className="mt-1 text-sm text-red-600">
                      {errors.instructions[index].message}
                    </p>
                  ),
              )}
            </div>
          </>
        )}

        {activeTab === "basic" && watch("type") === "target_points" && (
          <div className="flex flex-1 gap-4">
            <div className="w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="targetGoal"
              >
                Target Goal
              </label>
              <input
                id="targetGoal"
                name="rules.targetGoal"
                type="number"
                min="1"
                className="mt-1 input"
                {...register("rules.targetGoal", { valueAsNumber: true })}
              />
              {errors.rules?.targetGoal && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rules.targetGoal.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="targetReward"
              >
                Target Reward
              </label>
              <input
                id="targetReward"
                name="rules.targetReward"
                type="number"
                min="1"
                className="mt-1 input"
                {...register("rules.targetReward", { valueAsNumber: true })}
              />
              {errors.rules?.targetReward && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rules.targetReward.message}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "basic" && watch("type") === "welcome" && (
          <div className="flex flex-1 gap-4">
            <div className="w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="welcomeGoal"
              >
                Welcome Goal
              </label>
              <input
                id="welcomeGoal"
                name="rules.welcomeGoal"
                type="number"
                min="1"
                className="mt-1 input"
                {...register("rules.welcomeGoal", { valueAsNumber: true })}
              />
              {errors.rules?.welcomeGoal && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rules.welcomeGoal.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="welcomeReward"
              >
                Welcome Reward
              </label>
              <input
                id="welcomeReward"
                name="rules.welcomeReward"
                type="number"
                min="1"
                className="mt-1 input"
                {...register("rules.welcomeReward", { valueAsNumber: true })}
              />
              {errors.rules?.welcomeReward && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rules.welcomeReward.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <input
              type="text"
              placeholder="Enter image URL"
              {...register("imageUrl")}
              className={`mb-2 input w-full ${
                errors.imageUrl?.message ? "border-red-500" : ""
              }`}
            />
            <label
              htmlFor={"image"}
              className="relative cursor-pointer flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
            >
              <div className="space-y-1 text-center justify-center">
                <Upload color="black" className="mx-auto" />
                <div className="flex text-sm text-gray-600">
                  <p className="mx-auto  cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a Image</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  const currentUrl = watch("imageUrl");
                  if (
                    file &&
                    (typeof currentUrl !== "string" || currentUrl.trim() === "")
                  ) {
                    setValue("imageUrl", file);
                  }
                }}
                className="sr-only"
              />
            </label>
          </div>
          {errors.imageUrl && (
            <p className="mt-1 text-sm text-red-500">
              {errors.imageUrl?.message}
            </p>
          )}

          {watch("imageUrl") && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <img
                src={
                  typeof watch("imageUrl") === "string" &&
                  watch("imageUrl").length > 0
                    ? watch("imageUrl")
                    : watch("imageUrl") instanceof File
                      ? URL.createObjectURL(watch("imageUrl"))
                      : ""
                }
                alt="Preview"
                className="h-40 w-40 object-cover rounded border border-gray-300"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="btn btn-ghost">
          Cancel
        </button>

        <button
          type="submit"
          className={` ${isSubmitting ? " btn-disabled" : "btn btn-primary"}  `}
          disabled={isSubmitting}
        >
          {/* Save */}
          {isSubmitting ? (
            <div className="flex">
              <LoadingSpinner />
              {event ? "Updating Event..." : "Creating Event..."}
            </div>
          ) : event ? (
            "Update Event"
          ) : (
            "Create Event"
          )}
        </button>
      </div>
    </form>
  );
};

SharedEventForm.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    startAt: PropTypes.shape({
      seconds: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    }),
    endAt: PropTypes.shape({
      seconds: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    }),
    createdAt: PropTypes.any,
    type: PropTypes.string,
    rules: PropTypes.object,
  }),
  activeTab: PropTypes.oneOf(["basic", "double", "challenge", "leaderboard"])
    .isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SharedEventForm;
