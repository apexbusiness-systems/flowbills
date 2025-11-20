import React, { useState } from 'react';
import { SupportChat } from '@/components/support/SupportChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, Mail, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Support = () => {
  const { t } = useTranslation();
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {t('support.pageTitle') || '24/7 Support Portal'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('support.pageDesc') || 'Get instant help with our AI-powered support system'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t('support.aiChat') || 'AI Chat Support'}
                </CardTitle>
                <CardDescription>
                  {t('support.aiChatDesc') || 'Instant answers to your questions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('support.aiChatInfo') || 'Get immediate help with product questions, technical issues, billing inquiries, and onboarding guidance.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {t('support.voiceSupport') || 'Voice Support'}
                </CardTitle>
                <CardDescription>
                  {t('support.voiceSupportDesc') || 'Talk to our AI assistant'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('support.voiceSupportInfo') || 'Use voice commands for hands-free support. Perfect for when you\'re on the go or prefer speaking.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t('support.availability') || 'Always Available'}
                </CardTitle>
                <CardDescription>
                  {t('support.availabilityDesc') || '24 hours a day, 7 days a week'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('support.availabilityInfo') || 'Our AI support never sleeps. Get help whenever you need it, day or night, anywhere in the world.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t('support.escalation') || 'Human Escalation'}
                </CardTitle>
                <CardDescription>
                  {t('support.escalationDesc') || 'Complex issues handled by experts'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('support.escalationInfo') || 'If our AI can\'t solve your issue, we\'ll connect you with a human expert for personalized assistance.'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('support.commonTopics') || 'Common Support Topics'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• {t('support.topic1') || 'Invoice processing and OCR features'}</li>
                <li>• {t('support.topic2') || 'Workflow automation and validation rules'}</li>
                <li>• {t('support.topic3') || 'Account setup and user management'}</li>
                <li>• {t('support.topic4') || 'Billing questions and subscription changes'}</li>
                <li>• {t('support.topic5') || 'Integration with accounting systems'}</li>
                <li>• {t('support.topic6') || 'Compliance and security questions'}</li>
                <li>• {t('support.topic7') || 'Troubleshooting technical issues'}</li>
                <li>• {t('support.topic8') || 'Training and onboarding assistance'}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <SupportChat 
        isMinimized={isChatMinimized} 
        onMinimize={() => setIsChatMinimized(!isChatMinimized)} 
      />
    </div>
  );
};

export default Support;
