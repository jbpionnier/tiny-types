import { isArray } from './isArray';
import { isDefined } from './isDefined';
import { isGreaterThan } from './isGreaterThan';
import { Failure, Predicate, Result, Success } from './Predicate';

/**
 * @desc Ensures that the `value` meets at least one of the provided {@link Predicate}s.
 *
 * @example
 * import { check, isEqualTo, isGreaterThan, isLessThan, or } from 'tiny-type'l
 *
 * class Percentage extends TinyType {
 *     constructor(public readonly value: number) {
 *         check('Percentage', value, or(isEqualTo(0), isGreaterThan(0)), or(isLessThan(100), isEqualTo(100));
 *     }
 * }
 *
 * @param {Predicate<T>} predicates
 * @returns {Predicate<T>}
 */
export function or<T>(...predicates: Array<Predicate<T>>): Predicate<T> {
    return new Or<T>(predicates);
}

/** @access private */
class Or<T> extends Predicate<T> {

    constructor(private readonly predicates: Array<Predicate<T>>) {
        super();

        if ([
                _ => isDefined().check(_),
                _ => isArray().check(_),
                _ => isGreaterThan(0).check(_.length),
            ].some(check => check(this.predicates) instanceof Failure)
        ) {
            throw new Error(`Looks like you haven\'t specified any predicates to check the value against?`);
        }
    }

    /** @override */
    check(value: T): Result<T> {
        const results    = this.predicates.map(predicate => predicate.check(value));
        const anySuccess = results.some(result => result instanceof Success);

        const failures = results.filter(_ => _ instanceof Failure)
            .map((_: Result<T>) => (_ as Failure<T>).description);

        const describe = (issues: string[]) => `either ${issues.join(', ').replace(/,([^,]*)$/, ' or$1')}`;

        return anySuccess
            ? new Success(value)
            : new Failure(value, describe(failures));
    }
}
