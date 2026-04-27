import fetch from 'node-fetch';

async function wipe() {
  try {
    const res = await fetch('http://localhost:3000/api/wipe-database', { method: 'POST' });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

wipe();
