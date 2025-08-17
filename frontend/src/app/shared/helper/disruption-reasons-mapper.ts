import { DisruptionReasons } from '../types/enums/disruption-reason';

export class DisruptionReasonMapper {
  private static readonly reasonToTranslationKeyMap: Record<DisruptionReasons, string> = {
    [DisruptionReasons.CANCELLATION_UNDER_14_DAYS_AND_OVER_3H]:
      'disruption-reasons.cancellation-under-14-days-and-over-3h',
    [DisruptionReasons.CANCELLATION_UNDER_14_DAYS_AND_NEVER_ARRIVED]:
      'disruption-reasons.cancellation-under-14-days-and-never-arrived',
    [DisruptionReasons.CANCELLATION_ON_DAY_OF_DEPARTURE_AND_OVER_3H]:
      'disruption-reasons.cancellation-on-day-of-departure-and-over-3h',
    [DisruptionReasons.CANCELLATION_ON_DAY_OF_DEPARTURE_AND_NEVER_ARRIVED]:
      'disruption-reasons.cancellation-on-day-of-departure-and-never-arrived',
    [DisruptionReasons.ARRIVED_3H_LATE]: 'disruption-reasons.arrived-3h-late',
    [DisruptionReasons.NEVER_ARRIVED]: 'disruption-reasons.never-arrived',
    [DisruptionReasons.OVERBOOKING]: 'disruption-reasons.overbooking',
    [DisruptionReasons.DENIED_BOARDING_WITHOUT_REASON]:
      'disruption-reasons.denied-boarding-without-reason',
    [DisruptionReasons.NOT_ELIGIBLE_REASON]: 'disruption-reasons.not-eligible-reason',
    [DisruptionReasons.CONDITIONS_NOT_FULFILLED]: 'disruption-reasons.conditions-not-fulfilled',
    [DisruptionReasons.OTHER]: 'disruption-reasons.other',
  };

  public static getTranslationKey(reason: DisruptionReasons): string {
    return this.reasonToTranslationKeyMap[reason];
  }
}
