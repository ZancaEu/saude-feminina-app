import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CycleService } from '../services/cycle.service';
import { SymptomModalComponent } from './symptom-modal/symptom-modal.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  isOpen = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private cycleService: CycleService
  ) { }

  toggleFab() {
    this.isOpen = !this.isOpen;
  }

  onMenstruation(): void {
    this.isOpen = false;
    const today = new Date().toISOString().split('T')[0];

    this.cycleService.getCycles().subscribe({
      next: (cycles) => {
        const activeCycle = cycles.find(c => c.end_date === null);

        if (activeCycle) {
          this.cycleService.updateCycle(activeCycle.id, today).subscribe({
            next: () => this.showToast('Ciclo encerrado com sucesso'),
            error: (err) => {
              const msg = err.error?.message || 'Erro ao encerrar ciclo';
              this.showToast(msg);
            }
          });
        } else {
          this.cycleService.createCycle(today).subscribe({
            next: () => this.showToast('Ciclo iniciado com sucesso'),
            error: (err) => {
              const msg = err.error?.errors?.start_date?.[0] || err.error?.message || 'Erro ao iniciar ciclo';
              this.showToast(msg);
            }
          });
        }
      },
      error: () => this.showToast('Erro de conexão com o servidor')
    });
  }

  async onSymptom(): Promise<void> {
    this.isOpen = false;
    const modal = await this.modalCtrl.create({
      component: SymptomModalComponent,
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75
    });
    await modal.present();
  }

  onEvent(): void {
    this.isOpen = false;
    this.showToast('Funcionalidade de eventos em breve!');
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
