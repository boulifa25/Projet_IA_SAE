import { stagesApi } from '@/lib/api';
import StageEvaluations from '@/components/StageEvaluations';

export default function EvaluationEnseignant() {
  return <StageEvaluations loadStages={stagesApi.mesStages} />;
}
