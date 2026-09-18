'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Progress, Text, Group, Stack } from '@mantine/core';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { RateLimitResult } from '@/lib/services/rateLimiter';
import { DebugLogger } from '@/lib/utils/debug';

interface RateLimitDisplayProps {
  result: RateLimitResult;
  message?: string;
  showProgress?: boolean;
  compact?: boolean;
}

export function RateLimitDisplay({
  result,
  message,
  showProgress = true,
  compact = false,
}: RateLimitDisplayProps) {
  const t = useTranslations('rateLimitDisplay');
  // Use the timer from result directly (managed by useRateLimit hook)
  const timeRemaining = result.lockoutTimeRemaining;

  // Smart debug logging - throttled to prevent console spam
  DebugLogger.logRender('RateLimitDisplay', {
    timeRemaining,
    isLocked: result.lockoutTimeRemaining > 0,
    allowed: result.allowed,
    totalAttempts: result.totalAttempts
  });

  // Only hide if there's no message AND no failed attempts
  if ((!message || message.trim() === '') && result.totalAttempts === 0 && timeRemaining === 0) {
    DebugLogger.logEvent('RateLimitDisplay', 'Component hidden - clean state');
    return null;
  }

  DebugLogger.logEvent('RateLimitDisplay', 'Component showing', {
    timeRemaining,
    totalAttempts: result.totalAttempts,
    allowed: result.allowed
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  const getAlertColor = (): string => {
    if (timeRemaining > 0) return 'red';
    if (result.attemptsRemaining <= 2) return 'orange';
    return 'blue';
  };

  const getIcon = () => {
    if (timeRemaining > 0) return <Clock size={16} />;
    if (result.attemptsRemaining <= 2) return <AlertTriangle size={16} />;
    return <Shield size={16} />;
  };

  const getTitle = (): string => {
    if (timeRemaining > 0) {
      return t('titleLocked');
    }
    if (result.attemptsRemaining <= 2) {
      return t('titleWarning');
    }
    return t('titleNotice');
  };

  const getProgressValue = (): number => {
    if (timeRemaining > 0) {
      // Show progress of lockout time
      const totalLockoutTime = result.lockoutLevel === 1 ? 120 : 600; // 2 min or 10 min
      const progress = ((totalLockoutTime - timeRemaining) / totalLockoutTime) * 100;
      return progress;
    }

    const maxAttempts = result.attemptsRemaining + result.totalAttempts;
    const progress = maxAttempts > 0 ? (result.attemptsRemaining / maxAttempts) * 100 : 0;
    return progress;
  };

  const getProgressColor = (): string => {
    if (timeRemaining > 0) return 'red';
    if (result.attemptsRemaining <= 1) return 'red';
    if (result.attemptsRemaining <= 2) return 'orange';
    return 'blue';
  };

  const getDisplayMessage = (): string => {
    if (message) return message;

    if (timeRemaining > 0) {
      const nextLockoutWarning = result.lockoutLevel >= 2
        ? t('repeatedFailuresWarning')
        : t('longerLockoutWarning');

      return `${t('waitBeforeRetry', { time: formatTime(timeRemaining) })}${nextLockoutWarning}`;
    }

    if (result.attemptsRemaining <= 2 && result.attemptsRemaining > 0) {
      const lockoutDuration = t('durationMinutes', { count: result.lockoutLevel === 0 ? 2 : 10 });
      return t('attemptsRemainingBeforeLockout', { count: result.attemptsRemaining, duration: lockoutDuration });
    }

    if (result.totalAttempts > 0) {
      return t('tooManyDetected');
    }

    return '';
  };

  if (compact) {
    return (
      <Text size="sm" c={getAlertColor()} ta="center">
        {timeRemaining > 0 ? (
          <Group gap="xs" justify="center">
            <Clock size={14} />
            <span>{t('lockedForCompact', { time: formatTime(timeRemaining) })}</span>
          </Group>
        ) : (
          getDisplayMessage()
        )}
      </Text>
    );
  }

  return (
    <Alert
      icon={getIcon()}
      title={getTitle()}
      color={getAlertColor()}
      radius={16}
      styles={{
        root: {
          backgroundColor: `rgba(${getAlertColor() === 'red' ? '239, 68, 68' : getAlertColor() === 'orange' ? '249, 115, 22' : '59, 130, 246'}, 0.08)`,
          border: `1px solid rgba(${getAlertColor() === 'red' ? '239, 68, 68' : getAlertColor() === 'orange' ? '249, 115, 22' : '59, 130, 246'}, 0.2)`,
        },
        title: {
          color: getAlertColor() === 'red' ? '#dc2626' : getAlertColor() === 'orange' ? '#ea580c' : '#2563eb',
          fontWeight: 600,
        },
        message: {
          color: getAlertColor() === 'red' ? '#dc2626' : getAlertColor() === 'orange' ? '#ea580c' : '#2563eb',
        },
      }}
    >
      <Stack gap="sm">
        <Text size="sm">
          {getDisplayMessage()}
        </Text>

        {showProgress && (
          <div>
            {timeRemaining > 0 ? (
              <Group gap="sm" align="center">
                <Progress
                  value={getProgressValue()}
                  color={getProgressColor()}
                  size="sm"
                  radius="xl"
                  style={{ flex: 1 }}
                />
                <Text size="xs" c="dimmed" style={{ minWidth: '40px', textAlign: 'right' }}>
                  {formatTime(timeRemaining)}
                </Text>
              </Group>
            ) : (
              (result.totalAttempts > 0 || result.attemptsRemaining < 5) && (
                <Group gap="sm" align="center">
                  <Text size="xs" c="dimmed" style={{ minWidth: '80px' }}>
                    {t('attemptsLeftLabel')}
                  </Text>
                  <Progress
                    value={getProgressValue()}
                    color={getProgressColor()}
                    size="sm"
                    radius="xl"
                    style={{ flex: 1 }}
                  />
                  <Text size="xs" c="dimmed" style={{ minWidth: '20px', textAlign: 'right' }}>
                    {result.attemptsRemaining}
                  </Text>
                </Group>
              )
            )}
          </div>
        )}

        {timeRemaining > 0 && (
          <Text size="xs" c="dimmed" ta="center">
            {t('autoRefreshNotice')}
          </Text>
        )}
      </Stack>
    </Alert>
  );
}