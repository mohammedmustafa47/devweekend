import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';

interface Habit {
  id: string;
  name: string;
  checks: boolean[]; // index 0 = Mon … 6 = Sun
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class HomePage implements OnInit {
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  habits: Habit[] = [];
  newHabitName = '';
  showInput = false;
  todayIndex = -1;

  ngOnInit() {
    // JS getDay: 0=Sun → we need 0=Mon … 6=Sun
    const jsDay = new Date().getDay();
    this.todayIndex = jsDay === 0 ? 6 : jsDay - 1;

    const saved = localStorage.getItem('habits');
    if (saved) {
      this.habits = JSON.parse(saved);
    }
  }

  private save() {
    localStorage.setItem('habits', JSON.stringify(this.habits));
  }

  /* ── Actions ── */

  toggleAddInput() {
    this.showInput = !this.showInput;
    this.newHabitName = '';
  }

  addHabit() {
    const name = this.newHabitName.trim();
    if (!name) return;
    this.habits.push({
      id: Date.now().toString(),
      name,
      checks: Array(7).fill(false),
    });
    this.newHabitName = '';
    this.showInput = false;
    this.save();
  }

  cancelAdd() {
    this.showInput = false;
    this.newHabitName = '';
  }

  toggle(habit: Habit, dayIndex: number) {
    habit.checks[dayIndex] = !habit.checks[dayIndex];
    this.save();
  }

  deleteHabit(id: string) {
    this.habits = this.habits.filter(h => h.id !== id);
    this.save();
  }

  /* ── Streak calculation ── */

  streak(habit: Habit): number {
    let count = 0;
    for (let i = habit.checks.length - 1; i >= 0; i--) {
      if (habit.checks[i]) count++;
      else break;
    }
    if (count === 0) {
      for (let i = habit.checks.length - 1; i >= 0; i--) {
        if (habit.checks[i]) count++;
        else if (count > 0) break;
      }
    }
    return count;
  }

  streakColor(habit: Habit): string {
    const s = this.streak(habit);
    if (s === 0) return '#2a2a35';   // empty / dormant
    if (s <= 2)  return '#f59e0b';   // amber  — warming up
    if (s <= 4)  return '#fb923c';   // orange — building
    if (s <= 5)  return '#f97316';   // deep orange — strong
    return '#ef4444';                // red-hot — on fire 🔥
  }

  completionPercent(habit: Habit): number {
    const checked = habit.checks.filter(Boolean).length;
    return Math.round((checked / 7) * 100);
  }

  /* ── Summary stats ── */

  totalChecked(): number {
    return this.habits.reduce((s, h) => s + h.checks.filter(Boolean).length, 0);
  }

  totalPossible(): number {
    return this.habits.length * 7;
  }

  overallPercent(): number {
    const total = this.totalPossible();
    return total === 0 ? 0 : Math.round((this.totalChecked() / total) * 100);
  }

  bestStreak(): number {
    if (this.habits.length === 0) return 0;
    return Math.max(...this.habits.map(h => this.streak(h)));
  }
}
