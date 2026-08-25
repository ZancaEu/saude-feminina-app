import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CycleService } from '../services/cycle.service';
import { MenstrualCycle } from '../models/cycle.model';
import { CyclePrediction } from '../models/prediction.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  currentDate = new Date();
  currentYear: number;
  currentMonth: number;
  monthName: string = '';
  weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  calendarDays: any[] = [];
  cycles: MenstrualCycle[] = [];
  predictions: CyclePrediction | null = null;
  isLoading = true;

  constructor(
    private cycleService: CycleService,
    private toastCtrl: ToastController
  ) {
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ionViewWillEnter(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.cycleService.getCycles().subscribe({
      next: (cycles) => {
        this.cycles = cycles;
        this.cycleService.getPredictions().subscribe({
          next: (predictions) => {
            this.predictions = predictions;
            this.buildCalendar();
            this.isLoading = false;
          },
          error: () => {
            this.buildCalendar();
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Erro ao carregar dados do ciclo');
      }
    });
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.buildCalendar();
  }

  buildCalendar(): void {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.monthName = `${months[this.currentMonth]} ${this.currentYear}`;

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ day: null, type: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = this.formatDate(this.currentYear, this.currentMonth + 1, day);
      const type = this.getDayType(dateStr);
      this.calendarDays.push({ day, date: dateStr, type });
    }
  }

  getDayType(dateStr: string): string | null {
    for (const cycle of this.cycles) {
      const start = cycle.start_date;
      const end = cycle.end_date;
      if (dateStr >= start && (end === null || dateStr <= end)) {
        return 'menstruation';
      }
    }

    if (this.predictions) {
      if (this.predictions.fertile_window_start && this.predictions.fertile_window_end) {
        if (dateStr >= this.predictions.fertile_window_start && dateStr <= this.predictions.fertile_window_end) {
          return 'fertile';
        }
      }
      if (this.predictions.fertile_window_end) {
        const ovulationDate = new Date(this.predictions.fertile_window_end);
        ovulationDate.setDate(ovulationDate.getDate() + 1);
        const ovStr = ovulationDate.toISOString().split('T')[0];
        if (dateStr === ovStr) {
          return 'ovulation';
        }
      }
    }

    return null;
  }

  onDayTap(dayObj: any): void {
    if (!dayObj.day) return;

    const dateStr = dayObj.date;
    const activeCycle = this.cycles.find(c => c.end_date === null);

    if (activeCycle) {
      if (dateStr >= activeCycle.start_date) {
        this.cycleService.updateCycle(activeCycle.id, dateStr).subscribe({
          next: () => {
            this.showToast('Ciclo encerrado com sucesso');
            this.loadData();
          },
          error: (err) => {
            const msg = err.error?.message || 'Erro ao encerrar ciclo';
            this.showToast(msg);
          }
        });
      } else {
        this.showToast('A data de fim não pode ser anterior ao início');
      }
    } else {
      this.cycleService.createCycle(dateStr).subscribe({
        next: () => {
          this.showToast('Ciclo iniciado com sucesso');
          this.loadData();
        },
        error: (err) => {
          const msg = err.error?.errors?.start_date?.[0] || err.error?.message || 'Erro ao iniciar ciclo';
          this.showToast(msg);
        }
      });
    }
  }

  private formatDate(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}
