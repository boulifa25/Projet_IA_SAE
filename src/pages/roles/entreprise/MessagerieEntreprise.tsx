import { stagesApi } from '@/lib/api';
import StageConversations from '@/components/StageConversations';

export default function MessagerieEntreprise() {
  return <StageConversations loadStages={stagesApi.mesStagesEntreprise} />;
}
