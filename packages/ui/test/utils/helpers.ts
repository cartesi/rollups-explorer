/**
 * Factory of stateful wait-status object. Using prototype pattern to avoid problems with
 * concurrency between test case that makes use of an instance.
 *
 * @description Return a stateful object to support testing callback calls like onSuccces, onSearchApplication etc.
 * That wait object representation helps to avoid infinite loop by making a computed prop change
 * when e.g. a deposit reset is called.
 * @returns
 */
export const factoryWaitStatus = () => {
    return {
        _status: "success",
        get props(): {
            status?: "success";
            isSuccess?: true;
        } {
            return this._status === "success"
                ? { status: "success", isSuccess: true }
                : {};
        },
        reset() {
            this._status = "idle";
        },
    };
};
