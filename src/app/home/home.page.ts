import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';

/* ── Data Models ── */

export interface Habit {
  id: string;
  name: string;
  history: { [dateStr: string]: boolean };
}

export interface WeekDay {
  dayName: string;   // e.g. "WED"
  dateLabel: string;  // e.g. "27"
  dateString: string; // e.g. "2026-05-27"
  isToday: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class HomePage implements OnInit, AfterViewInit {
  habits: Habit[] = [];
  weekDays: WeekDay[] = [];
  newHabitName = '';
  showInput = false;

  private todayStr = '';

  @ViewChild('gridScrollContainer') gridScrollContainer!: ElementRef<HTMLElement>;

  /* ══════════════════════════════════════════════
     Lifecycle
     ══════════════════════════════════════════════ */

  ngOnInit(): void {
    this.todayStr = this.toDateString(new Date());
    this.generateWeek();
    this.loadHabits();
  }

  ngAfterViewInit(): void {
    // Auto-scroll to today's column on compact screens
    setTimeout(() => {
      const todayEl = this.gridScrollContainer?.nativeElement?.querySelector('.today-header');
      todayEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 150);
  }

  /* ══════════════════════════════════════════════
     Week Generation
     ══════════════════════════════════════════════ */

  private generateWeek(): void {
    const today = new Date();
    const jsDay = today.getDay(); // 0 = Sun
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    this.weekDays = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateString = this.toDateString(d);

      this.weekDays.push({
        dayName: dayNames[i],
        dateLabel: d.getDate().toString(),
        dateString,
        isToday: dateString === this.todayStr,
        isPast: dateString < this.todayStr,
      });
    }
  }

  /** Format Date → 'YYYY-MM-DD' */
  private toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /* ══════════════════════════════════════════════
     Persistence  (localStorage key = 'habits_v2')
     ══════════════════════════════════════════════ */

  private loadHabits(): void {
    const raw = localStorage.getItem('habits_v2');
    if (raw) {
      try { this.habits = JSON.parse(raw); } catch { this.habits = []; }
    }
  }

  private save(): void {
    localStorage.setItem('habits_v2', JSON.stringify(this.habits));
  }

  /* ══════════════════════════════════════════════
     CRUD Actions
     ══════════════════════════════════════════════ */

  toggleAddInput(): void {
    this.showInput = !this.showInput;
    this.newHabitName = '';
  }

  addHabit(): void {
    const name = this.newHabitName.trim();
    if (!name) return;
    this.habits.push({ id: Date.now().toString(), name, history: {} });
    this.newHabitName = '';
    this.showInput = false;
    this.save();
  }

  cancelAdd(): void {
    this.showInput = false;
    this.newHabitName = '';
  }

  toggle(habit: Habit, day: WeekDay): void {
    if (day.isPast) return; // past days are locked
    habit.history[day.dateString] = !habit.history[day.dateString];
    this.save();
  }

  isChecked(habit: Habit, day: WeekDay): boolean {
    return !!habit.history[day.dateString];
  }

  deleteHabit(id: string): void {
    this.habits = this.habits.filter(h => h.id !== id);
    this.save();
  }

  /* ══════════════════════════════════════════════
     Streak Calculation (walks backwards from today)
     ══════════════════════════════════════════════ */

  streak(habit: Habit): number {
    let count = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const ds = this.toDateString(cursor);
      if (habit.history[ds]) {
        count++;
      } else {
        // Skip today if not yet checked — streak may still be alive from yesterday
        if (i === 0) { cursor.setDate(cursor.getDate() - 1); continue; }
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  streakColor(habit: Habit): string {
    const s = this.streak(habit);
    if (s === 0) return '#2a2a35';
    if (s <= 2)  return '#f59e0b';
    if (s <= 4)  return '#fb923c';
    if (s <= 5)  return '#f97316';
    return '#ef4444';
  }

  /* ══════════════════════════════════════════════
     Summary Statistics (scoped to active week)
     ══════════════════════════════════════════════ */

  totalChecked(): number {
    return this.habits.reduce(
      (sum, h) => sum + this.weekDays.filter(d => h.history[d.dateString]).length, 0,
    );
  }

  totalPossible(): number {
    return this.habits.length * 7;
  }

  overallPercent(): number {
    const t = this.totalPossible();
    return t === 0 ? 0 : Math.round((this.totalChecked() / t) * 100);
  }

  bestStreak(): number {
    return this.habits.length === 0
      ? 0
      : Math.max(...this.habits.map(h => this.streak(h)));
  }
}
