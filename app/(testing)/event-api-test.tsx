/**
 * Event API Test Screen
 * 
 * This screen provides a UI to run manual tests for the event-api.ts module.
 * Navigate to this screen to test all API functions.
 * 
 * Usage: Navigate to /(testing)/event-api-test in the app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {
  runAllEventAPITests,
  runAllAPITests,
  runAllHelperTests,
  tests,
  TEST_CONFIG,
} from '../../lib/__tests__/event-api.manual-test';

export default function EventAPITestScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string>('');

  // Capture console logs
  const captureConsole = () => {
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    console.error = (...args: any[]) => {
      logs.push(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    return {
      getLogs: () => logs.join('\n'),
      restore: () => {
        console.log = originalLog;
        console.error = originalError;
      },
    };
  };

  const runTests = async (testFn: () => Promise<void>, testName: string) => {
    setIsRunning(true);
    setTestOutput(`Running ${testName}...\n\n`);

    const capture = captureConsole();

    try {
      await testFn();
      const output = capture.getLogs();
      setTestOutput(output);
    } catch (error: any) {
      setTestOutput(`Error running tests: ${error.message}\n\n${capture.getLogs()}`);
    } finally {
      capture.restore();
      setIsRunning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Event API Test Suite</Text>
          <Text style={styles.subtitle}>
            Test all event-api.ts functions
          </Text>
        </View>

        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Test Configuration</Text>
          <Text style={styles.configText}>Community: {TEST_CONFIG.communitySlug}</Text>
          <Text style={styles.configText}>Event ID: {TEST_CONFIG.eventId}</Text>
          <Text style={styles.configText}>Creator ID: {TEST_CONFIG.creatorId}</Text>
          <Text style={styles.warningText}>
            ⚠️ Update TEST_CONFIG in event-api.manual-test.ts with real IDs
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => runTests(runAllEventAPITests, 'All Tests')}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => runTests(runAllHelperTests, 'Helper Function Tests')}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>Run Helper Tests Only</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => runTests(runAllAPITests, 'API Function Tests')}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>Run API Tests Only</Text>
          </TouchableOpacity>
        </View>

        {isRunning && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Running tests...</Text>
          </View>
        )}

        {testOutput && (
          <View style={styles.outputSection}>
            <Text style={styles.outputTitle}>Test Output:</Text>
            <ScrollView style={styles.outputScroll}>
              <Text style={styles.outputText}>{testOutput}</Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#3b82f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  configSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  configText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonSection: {
    margin: 16,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSection: {
    margin: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  outputSection: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 400,
  },
  outputTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
    color: '#111827',
  },
  outputScroll: {
    maxHeight: 350,
  },
  outputText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    padding: 16,
    paddingTop: 0,
  },
});
