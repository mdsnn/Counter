import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

// ⚠️ Replace with your machine’s IP address
const API_URL =  'http://192.168.0.101:8000/students';

export default function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await axios.get(API_URL);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err.message);
    }
  };

  const addStudent = async () => {
    if (!name.trim()) return;
    try {
      const res = await axios.post(API_URL, { name });
      setStudents([...students, res.data]);
      setName('');
    } catch (err) {
      console.error('Error adding student:', err.message);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setStudents(students.filter((student) => student.id !== id));
    } catch (err) {
      console.error('Error deleting student:', err.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student List</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter student name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Button title="Add" onPress={addStudent} />
      </View>

      {students.length === 0 ? (
        <Text style={styles.empty}>No students yet.</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item.name}</Text>
              <TouchableOpacity onPress={() => deleteStudent(item.id)}>
                <Text style={styles.delete}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    padding: 5,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  delete: {
    color: 'red',
    fontSize: 18,
  },
  empty: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
