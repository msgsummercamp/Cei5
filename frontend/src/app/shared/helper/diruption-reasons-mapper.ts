import { DisruptionReasons } from '../types/enums/disruption-reason';

export class DisruptionReasonMapper {
  private static readonly reasonToTranslationKeyMap: Record<DisruptionReasons, string> = {
    [DisruptionReasons.CANCELATION_NOTICE_UNDER_14_DAYS]:
      'disruption-reasons.cancellation-notice-under-14-days',
    [DisruptionReasons.CANCELATION_NOTICE_OVER_14_DAYS]:
      'disruption-reasons.cancellation-notice-over-14-days',
    [DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE]:
      'disruption-reasons.cancellation-on-day-of-departure',
    [DisruptionReasons.ARRIVED_3H_LATE]: 'disruption-reasons.arrived-3h-late',
    [DisruptionReasons.ARRIVED_EARLY]: 'disruption-reasons.arrived-early',
    [DisruptionReasons.NEVER_ARRIVED]: 'disruption-reasons.never-arrived',
    [DisruptionReasons.DID_NOT_GIVE_THE_SEAT_VOLUNTARILY]:
      'disruption-reasons.did-not-give-the-seat-voluntarily',
    [DisruptionReasons.DID_GIVE_THE_SEAT_VOLUNTARILY]:
      'disruption-reasons.did-give-the-seat-voluntarily',
  };

  public static getTranslationKey(reason: DisruptionReasons): string {
    return this.reasonToTranslationKeyMap[reason];
  }
}
