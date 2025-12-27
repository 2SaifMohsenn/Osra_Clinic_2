import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { getAppointments } from '@/src/api/appointments';
import { getPatients } from '@/src/api/patients';

// Theme Constants
const COLOR_PRIMARY = '#2E8BC0';
const COLOR_BG = '#F8FAFC';
const COLOR_CARD = '#FFFFFF';
const COLOR_TEXT = '#0F172A';
const COLOR_SUBTEXT = '#64748B';
const COLOR_BORDER = '#F1F5F9';

const screenWidth = Dimensions.get('window').width - 48;

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [appointmentsCount, setAppointmentsCount] = useState({
    labels: ['...'],
    datasets: [{ data: [0] }],
  });
  const [patientActivity, setPatientActivity] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [appts, patients] = await Promise.all([
        getAppointments(),
        getPatients()
      ]);

      // 1. Process Chart Data (Last 6 Months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push({
          label: months[d.getMonth()],
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          count: 0
        });
      }

      appts.forEach((a: any) => {
        if (!a.appointment_date) return;
        const monthKey = a.appointment_date.substring(0, 7); // "YYYY-MM"
        const found = last6Months.find(m => m.key === monthKey);
        if (found) found.count++;
      });

      setAppointmentsCount({
        labels: last6Months.map(m => m.label),
        datasets: [{ data: last6Months.map(m => m.count) }]
      });

      // 2. Process Patient Activity
      const activityMap: Record<number, { name: string, count: number, last: string }> = {};

      // Initialize with names
      patients.forEach((p: any) => {
        activityMap[p.id] = { name: `${p.first_name} ${p.last_name}`, count: 0, last: 'None' };
      });

      appts.forEach((a: any) => {
        const pID = typeof a.patient === 'object' ? a.patient.id : a.patient;
        if (activityMap[pID]) {
          activityMap[pID].count++;
          if (a.appointment_date > (activityMap[pID].last === 'None' ? '' : activityMap[pID].last)) {
            activityMap[pID].last = a.appointment_date;
          }
        }
      });

      const sortedActivity = Object.values(activityMap)
        .filter(p => p.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 active patients

      setPatientActivity(sortedActivity);

    } catch (err) {
      console.log('Analytics Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
        <Text style={styles.loadingText}>Synthesizing Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Clinical Insights</Text>
          <Text style={styles.headerSub}>Operational Analytics & Patient Trends</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadAnalytics}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Monthly Volume Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📅 Visit Volume</Text>
            <Text style={styles.cardTag}>LAST 6 MONTHS</Text>
          </View>
          <BarChart
            data={appointmentsCount}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(46, 139, 192, ${opacity})`, // Primary Blue
              labelColor: () => COLOR_SUBTEXT,
              style: { borderRadius: 16 },
              propsForLabels: {
                fontSize: 10,
                fontWeight: '600'
              },
              barPercentage: 0.6,
            }}
            style={styles.chart}
            verticalLabelRotation={0}
          />
        </View>

        {/* Patient Activity Table */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👥 Patient Engagement</Text>
            <Text style={styles.cardTag}>TOP RECURRING</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>PATIENT</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>VISITS</Text>
            <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'right' }]}>LAST VISIT</Text>
          </View>

          {patientActivity.map((p, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.cellText, { flex: 2, fontWeight: '700' }]}>{p.name}</Text>
              <View style={[styles.visitBadge, { flex: 1 }]}>
                <Text style={styles.visitText}>{p.count}</Text>
              </View>
              <Text style={[styles.cellText, { flex: 1.5, textAlign: 'right', color: COLOR_SUBTEXT }]}>{p.last}</Text>
            </View>
          ))}

          {patientActivity.length === 0 && (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyText}>No activity data available.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLOR_TEXT,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: COLOR_SUBTEXT,
    fontWeight: '600',
    marginTop: 2,
  },
  refreshBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PRIMARY,
  },
  scrollContent: {
    padding: 24,
  },
  card: {
    backgroundColor: COLOR_CARD,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLOR_TEXT,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLOR_PRIMARY,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 1,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '800',
    color: COLOR_SUBTEXT,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  cellText: {
    fontSize: 14,
    color: COLOR_TEXT,
  },
  visitBadge: {
    alignItems: 'center',
  },
  visitText: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '800',
    color: COLOR_PRIMARY,
  },
  emptyActivity: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLOR_SUBTEXT,
    fontSize: 14,
    fontWeight: '600',
  }
});
