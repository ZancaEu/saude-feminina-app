<?php

namespace App\Http\Controllers;

use App\Models\MenstrualCycle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class PredictionController extends Controller
{
    public function index(): JsonResponse
    {
        $cycles = MenstrualCycle::where('user_id', 1)
            ->orderBy('start_date', 'desc')
            ->get();

        if ($cycles->isEmpty()) {
            return response()->json([
                'predicted_next_start' => null,
                'fertile_window_start' => null,
                'fertile_window_end' => null,
                'average_cycle_length' => null,
                'current_phase' => null,
                'current_day' => null,
                'message' => 'Registre pelo menos um ciclo para obter predições.',
            ]);
        }

        $averageCycleLength = $this->calculateAverageCycleLength($cycles);
        $lastCycle = $cycles->first();
        $currentDay = $this->calculateCurrentDay($lastCycle);
        $currentPhase = $this->determinePhase($currentDay);
        $predictedNextStart = $this->predictNextStart($lastCycle, $averageCycleLength);
        [$fertileStart, $fertileEnd] = $this->calculateFertileWindow($predictedNextStart);

        return response()->json([
            'predicted_next_start' => $predictedNextStart?->format('Y-m-d'),
            'fertile_window_start' => $fertileStart?->format('Y-m-d'),
            'fertile_window_end' => $fertileEnd?->format('Y-m-d'),
            'average_cycle_length' => $averageCycleLength,
            'current_phase' => $currentPhase,
            'current_day' => $currentDay,
        ]);
    }

    private function calculateAverageCycleLength($cycles): int
    {
        $completeCycles = $cycles->filter(fn ($cycle) => $cycle->end_date !== null);

        if ($completeCycles->count() < 3) {
            return 28;
        }

        $sortedCycles = $cycles->sortBy('start_date')->values();
        $lengths = [];

        for ($i = 1; $i < min($sortedCycles->count(), 7); $i++) {
            $length = $sortedCycles[$i - 1]->start_date->diffInDays($sortedCycles[$i]->start_date);
            if ($length > 0 && $length <= 45) {
                $lengths[] = $length;
            }
        }

        if (empty($lengths)) {
            return 28;
        }

        $lengths = array_slice($lengths, -6);
        if (count($lengths) < 3) {
            return 28;
        }

        return (int) round(array_sum($lengths) / count($lengths));
    }

    private function calculateCurrentDay($lastCycle): int
    {
        $today = Carbon::today();
        return (int) $lastCycle->start_date->diffInDays($today) + 1;
    }

    private function determinePhase(int $currentDay): string
    {
        if ($currentDay >= 1 && $currentDay <= 5) {
            return 'Menstrual';
        }
        if ($currentDay >= 6 && $currentDay <= 13) {
            return 'Folicular';
        }
        if ($currentDay === 14) {
            return 'Ovulatória';
        }
        return 'Lútea';
    }

    private function predictNextStart($lastCycle, int $averageCycleLength): ?Carbon
    {
        return $lastCycle->start_date->copy()->addDays($averageCycleLength);
    }

    private function calculateFertileWindow(?Carbon $predictedNextStart): array
    {
        if (!$predictedNextStart) {
            return [null, null];
        }

        $ovulation = $predictedNextStart->copy()->subDays(14);
        $fertileStart = $ovulation->copy()->subDays(5);
        $fertileEnd = $ovulation->copy()->subDay();

        return [$fertileStart, $fertileEnd];
    }
}
