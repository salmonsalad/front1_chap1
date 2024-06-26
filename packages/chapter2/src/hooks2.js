export function createHooks(callback) {
  let isScheduled = false; // 새로운 상태로 업데이트 예약 여부를 추적하는 변수

  const stateContext = {
    current: 0,
    states: [],
  };

  const memoContext = {
    current: 0,
    memos: [],
  };

  function resetContext() {
    stateContext.current = 0;
    memoContext.current = 0;
    isScheduled = false; // 컨텍스트를 리셋할 때 업데이트 예약 여부도 리셋
  }

  const useState = (initState) => {
    const { current, states } = stateContext;
    if (stateContext.states[current] === undefined) {
      stateContext.states[current] = initState;
    }
    stateContext.current += 1;

    const setState = (newState) => {
      states[current] = newState;
      if (!isScheduled) { // 아직 업데이트가 예약되지 않았다면
        isScheduled = true; // 업데이트를 예약하고
        requestAnimationFrame(() => {
          callback(); // 다음 애니메이션 프레임에 콜백을 호출
          isScheduled = false; // 콜백 호출 후, 업데이트 예약 상태를 리셋
        });
      }
    };

    return [states[current], setState];
  };

  const useMemo = (fn, refs) => {
    const { current, memos } = memoContext;
    memoContext.current += 1;

    const memo = memos[current];

    const resetAndReturn = () => {
      const value = fn();
      memos[current] = {
        value,
        refs,
      };
      return value;
    };

    if (!memo) {
      return resetAndReturn();
    }

    if (refs.length > 0 && memo.refs.find((v, k) => v !== refs[k])) {
      return resetAndReturn();
    }
    return memo.value;
  };

  return { useState, useMemo, resetContext };
}
