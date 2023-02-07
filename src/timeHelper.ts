import moment, {unitOfTime} from 'moment-mini';

const unitMapper: { [id: string]: unitOfTime.DurationConstructor } = {
    'y': 'y',
    'm': 'M',
    'w': 'w',
    'd': 'd',
};

/**
 * Convert a delta string like "21y" to a moment Duration object
 * @param delta
 * @return {moment.Duration}
 */
const timeDeltaToMomentDuration = (delta: string) => {
    const matched = delta.match(/(-?\d+)(\w)/);

    if (!matched) throw new Error(`Invalid time delta ${delta}`);

    const [, amount, unit] = matched;

    return moment.duration(parseInt(amount, 10), unitMapper[unit]);
};

/**
 * Given a time delta like "-21y", apply it to the passed in date object, or the current time
 * @param delta String
 * @param date Date
 * @return {Date}
 */
const applyDeltaToDate = (delta: string, date = new Date()) => moment(date)
    .add(timeDeltaToMomentDuration(delta))
    .toDate();

export = {
    applyDeltaToDate
}
