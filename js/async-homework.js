async function loadDemoProductsAsync() {
  const response = await fetch('https://dummyjson.com/products?limit=3');
  if (!response.ok) throw new Error('Load error: ' + response.status);
  return await response.json();
}

async function sendDemoOrderPreviewAsync(cartPreview) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(cartPreview)
  });
  if (!response.ok) throw new Error('Send error: ' + response.status);
  return await response.json();
}

async function delayAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAsyncHomeworkDemo() {
  try {
    await loadDemoProductsAsync();
    await delayAsync(300);
    await sendDemoOrderPreviewAsync({
      count: 1,
      note: 'preview'
    });
  } catch (_) {
  }
}

document.addEventListener('DOMContentLoaded', runAsyncHomeworkDemo);
