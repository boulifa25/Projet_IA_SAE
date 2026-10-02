import { stagesApi } from '@/lib/api';
import StageEvaluations from '@/components/StageEvaluations';

export default function EvaluationEntreprise() {
  return <StageEvaluations loadStages={stagesApi.mesStagesEntreprise} />;
}
