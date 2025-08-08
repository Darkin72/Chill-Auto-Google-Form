export function sendForm(answer) {
  let isValid = false;
  for (let id in answer) {
    if (answer[id]["mustAnswer"]) {
      isValid = true;
    }
  }
  if (isValid) console.log(`Sent form answer :`, answer);
}
