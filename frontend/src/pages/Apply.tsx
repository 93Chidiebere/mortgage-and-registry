import { MainLayout } from '@/components/layout';
import { ApplicationWizard } from '@/components/application';

export default function Apply() {
  return (
    <MainLayout>
      <div className="py-8">
        <ApplicationWizard />
      </div>
    </MainLayout>
  );
}
