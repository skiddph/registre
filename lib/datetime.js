const dayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return [Number(start), Number(end)];
}

const amRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(11, 59, 59, 999);
  return [Number(start), Number(end), "AM"];
}

const pmRange = () => {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return [Number(start), Number(end), "PM"]; 
}

const getRange = () => {
  const now = Number(Date.now());
  const am = amRange();
  const pm = pmRange();
  const range = now >= am[0] && now <= am[1] ? am : pm;
  return range;
}

const getDate = (dt) => {
  const { year, month, day, hour, minute, second, ms } = dt
  const d = new Date()
  d.setFullYear(year, month, day)
  d.setHours(hour, minute, second, ms)
  return new Date(d).getTime()
}

module.exports = {
  dayRange,
  amRange,
  pmRange,
  getRange,
  getDate
}