export enum Status {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type Success<T> = {
  status: Status.SUCCESS;
  value: T;
};

export type Failure<E> = {
  status: Status.FAILURE;
  error: E;
};

export type Result<T = any, E = any> = Success<T> | Failure<E>;

export const FailureResult = <T>(error: T): Failure<T> => ({
  status: Status.FAILURE,
  error,
});

export const SuccessResult = <T>(value: T): Success<T> => ({
  status: Status.SUCCESS,
  value,
});
