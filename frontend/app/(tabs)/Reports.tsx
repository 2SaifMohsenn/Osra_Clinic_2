import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { CARD_BG, CARD_SHADOW, PRIMARY } from './PatientDashboard';

const screenWidth = Dimensions.get('window').width - 40;

export default function Reports() {
  const [appointmentsData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [45, 60, 70, 55, 80, 65] }],
  });

  const [incomeData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [2000, 3500, 3000, 4200, 5000, 4700] }],
  });

  const [activityData] = useState([
    { id: 1, name: 'John Doe', visits: 5, lastVisit: '2025-10-10' },
    { id: 2, name: 'Jane Smith', visits: 3, lastVisit: '2025-10-15' },
    { id: 3, name: 'Mark Johnson', visits: 8, lastVisit: '2025-10-20' },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Reports & Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Monthly Appointments Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Monthly Appointments</Text>
          <BarChart
            data={appointmentsData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: CARD_BG,
              backgroundGradientFrom: '#E0F2FE',
              backgroundGradientTo: '#BFDBFE',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: () => '#0f172a',
              style: { borderRadius: 12 },
            }}
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Income Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💰 Monthly Income</Text>
          <LineChart
            data={incomeData}
            width={screenWidth}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: CARD_BG,
              backgroundGradientFrom: '#DCFCE7',
              backgroundGradientTo: '#BBF7D0',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
              labelColor: () => '#0f172a',
              style: { borderRadius: 12 },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Patient Activity Report */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👥 Patient Activity Reports</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 1.5 }]}>Patient</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Visits</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Last Visit</Text>
          </View>
          {activityData.map((p) => (
            <View key={p.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{p.name}</Text>
              <Text style={styles.tableCell}>{p.visits}</Text>
              <Text style={styles.tableCell}>{p.lastVisit}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ----- Styles ----- */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    ...CARD_SHADOW,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0f172a' },

  tableHeader: {
    backgroundColor: '#E0F2FE',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  tableCell: { flex: 1, color: '#0f172a' },
  headerCell: { fontWeight: '700', color: PRIMARY },
});
