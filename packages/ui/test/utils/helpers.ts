/**
 * Stateful object to support testing callback calls like onSuccces, onSearchApplication etc.
 * That wait object representation helps to avoid infinite loop by making a computed prop change
 * when deposit reset is called.
 */
export const depositWaitStatus = {
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
