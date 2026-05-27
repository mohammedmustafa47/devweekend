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
  isFuture: boolean;
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
  selectedFilter: 'weekly' | 'monthly' = 'weekly';
  currentWeekOffset = 0;
  showConfirmModal = false;
  pendingLogSelection: { habitId: string; dateString: string } | null = null;
  showDeleteConfirmModal = false;
  pendingDeleteHabitId: string | null = null;
  isDark = false;
  private todayStr = '';

  @ViewChild('gridScrollContainer') gridScrollContainer!: ElementRef<HTMLElement>;

  /* ══════════════════════════════════════════════
     Lifecycle
     ══════════════════════════════════════════════ */

  ngOnInit(): void {
    this.todayStr = this.toDateString(new Date());
    this.generateWeek();
    this.loadHabits();
    const savedTheme = localStorage.getItem('darkMode');
    this.setTheme(savedTheme === null ? true : savedTheme === 'true');
  }

  setTheme(isDark: boolean): void {
    this.isDark = isDark;
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', String(isDark));
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
    const viewedDate = new Date();
    viewedDate.setDate(viewedDate.getDate() + (this.currentWeekOffset * 7));

    const jsDay = viewedDate.getDay(); // 0 = Sun
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;

    const monday = new Date(viewedDate);
    monday.setDate(viewedDate.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    this.weekDays = [];

    

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateString = this.toDateString(d);
      const isFuture = dateString > this.todayStr;

      this.weekDays.push({
        dayName: dayNames[i],
        dateLabel: d.getDate().toString(),
        dateString,
        isToday: dateString === this.todayStr,
        isPast: dateString < this.todayStr,
        isFuture,
      });
    }
  }

  goToPreviousWeek(): void {
    this.currentWeekOffset -= 1;
    this.generateWeek();
  }

  goToNextWeek(): void {
    this.currentWeekOffset += 1;
    this.generateWeek();
  }

  goToCurrentWeek(): void {
    this.currentWeekOffset = 0;
    this.generateWeek();
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
    if (this.isCellLocked(habit, day)) return;

    this.pendingLogSelection = {
      habitId: habit.id,
      dateString: day.dateString,
    };
    this.showConfirmModal = true;
  }

  confirmHabitLog(): void {
    const selection = this.pendingLogSelection;
    if (!selection) return;

    const habit = this.habits.find(h => h.id === selection.habitId);
    if (!habit) {
      this.cancelHabitLog();
      return;
    }

    habit.history[selection.dateString] = true;
    this.save();
    this.cancelHabitLog();
  }

  cancelHabitLog(): void {
    this.pendingLogSelection = null;
    this.showConfirmModal = false;
  }

  isChecked(habit: Habit, day: WeekDay): boolean {
    if (day.isFuture) return false;
    return !!habit.history[day.dateString];
  }

  isCellLocked(habit: Habit, day: WeekDay): boolean {
    return day.isPast || day.isFuture || this.isChecked(habit, day);
  }

  requestDeleteHabit(id: string): void {
    this.pendingDeleteHabitId = id;
    this.showDeleteConfirmModal = true;
  }

  confirmDeleteHabit(): void {
    if (!this.pendingDeleteHabitId) return;
    this.deleteHabit(this.pendingDeleteHabitId);
    this.cancelDeleteHabit();
  }

  cancelDeleteHabit(): void {
    this.pendingDeleteHabitId = null;
    this.showDeleteConfirmModal = false;
  }

  private deleteHabit(id: string): void {
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
     Consistency Filter
     ══════════════════════════════════════════════ */

  getHabitConsistency(habit: Habit): number {
    if (this.selectedFilter === 'monthly') {
      return this.getMonthlyConsistency(habit);
    }
    return this.getWeeklyConsistency(habit);
  }

  private getWeeklyConsistency(habit: Habit): number {
    const checked = this.weekDays.filter(d => this.isChecked(habit, d)).length;
    return Math.round((checked / 7) * 100);
  }

  private getMonthlyConsistency(habit: Habit): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;

    let checked = 0;
    for (const [key, val] of Object.entries(habit.history)) {
      if (val && key.startsWith(monthPrefix)) checked++;
    }
    return Math.round((checked / daysInMonth) * 100);
  }

  consistencyColor(habit: Habit): string {
    const pct = this.getHabitConsistency(habit);
    if (pct >= 70) return '#34d399'; // mint green
    if (pct < 45)  return '#fb7185'; // coral-red
    return '#8b8b9b';                // neutral
  }

  get consistencyLabel(): string {
    return this.selectedFilter === 'monthly' ? 'this month' : 'this week';
  }

  /* ══════════════════════════════════════════════
     Summary Statistics (scoped to active week)
     ══════════════════════════════════════════════ */

  totalChecked(): number {
    return this.habits.reduce(
      (sum, h) => sum + this.weekDays.filter(d => this.isChecked(h, d)).length, 0,
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

  toggleTheme(): void {
    this.setTheme(!this.isDark);
  }
}
