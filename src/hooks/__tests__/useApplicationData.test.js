import { renderHook } from "@testing-library/react-hooks";

import useApplicationData from "hooks/useApplicationData";

test("useApplicationData should return state object", () => {
  const { result } = renderHook(() => useApplicationData());
  
  //Very simplistic testing - simply assert that items are returned
  expect(typeof result.current.state).toBe('object');
  expect(typeof result.current.setDay).toBe('function');
  expect(typeof result.current.bookInterview).toBe('function');
  expect(typeof result.current.cancelInterview).toBe('function');

  /* Why does the below not work?
  expect(result.current.state).toBe(
    expect.objectContaining({
      appointments: expect.any(Object),
      day: expect.any(String),
      days: expect.any(Array),
    })
  );
  */
});
