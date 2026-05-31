export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDateRangeForView(date, view) {
  const start = new Date(date);
  const end = new Date(date);

  switch (view) {
    case 'month': {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const dayOfWeek = start.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + mondayOffset);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 41);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'week': {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + mondayOffset);
      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'day': {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    default:
      break;
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

export function navigateDate(date, view, direction) {
  const d = new Date(date);
  switch (view) {
    case 'month':
      d.setMonth(d.getMonth() + direction);
      break;
    case 'week':
      d.setDate(d.getDate() + direction * 7);
      break;
    case 'day':
      d.setDate(d.getDate() + direction);
      break;
  }
  return d;
}

export function formatWeekRange(days) {
  const first = days[0];
  const last = days[6];
  const opts = { day: 'numeric', month: 'long' };

  if (first.getFullYear() !== last.getFullYear()) {
    return `${first.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })} – ${last.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })}`;
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${first.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })} – ${last.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })}`;
  }
  return `${first.getDate()} – ${last.getDate()} de ${first.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`;
}
