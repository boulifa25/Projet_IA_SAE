import { stagesApi } from '@/lib/api';
import StageConversations from '@/components/StageConversations';

export default function MessagerieEnseignant() {
  return <StageConversations loadStages={stagesApi.mesStages} />;
}
