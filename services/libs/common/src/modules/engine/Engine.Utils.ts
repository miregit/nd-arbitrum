export const timeframeParser = (timeInput: Date): string => {
  const year = timeInput.getFullYear()
  const month = (timeInput.getMonth() + 1).toString().padStart(2, "0")
  const day = timeInput.getDate().toString().padStart(2, "0")
  // eslint-disable-next-line max-len
  const res = `${year}-${month}-${day} ${timeInput.getUTCHours()}:${timeInput.getUTCMinutes()}:${timeInput.getUTCSeconds()}.${timeInput.getUTCMilliseconds()}`
  return res
}
