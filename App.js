import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Replace with your actual backend URL when deploying
// For development on the same machine, use your computer's local IP
const API_URL = 'http://192.168.58.233:8000';

export default function App() {
  const [name, setName] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  // Fetch all students when component mounts
  useEffect(() => {
    fetchStudents();
  }, []);

  // Function to fetch all students
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to fetch students. Make sure your backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to add a new student
  const addStudent = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a student name');
      return;
    }

    setAddingStudent(true);
    
    try {
      const response = await fetch(`${API_URL}/students/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newStudent = await response.json();
      setStudents([...students, newStudent]);
      setName(''); // Clear input field
    } catch (error) {
      console.error('Error adding student:', error);
      Alert.alert('Error', 'Failed to add student.');
    } finally {
      setAddingStudent(false);
    }
  };

  // Function to delete a student
  const deleteStudent = async (id) => {
    setDeletingStudentId(id);
    
    try {
      const response = await fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Remove the deleted student from the state
      setStudents(students.filter(student => student.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      Alert.alert('Error', 'Failed to delete student.');
    } finally {
      setDeletingStudentId(null);
    }
  };

  // Function to handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  // Render a student item
  const renderItem = ({ item }) => (
    <View style={styles.studentItem}>
      <Text style={styles.studentName}>{item.name}</Text>
      {deletingStudentId === item.id ? (
        <ActivityIndicator size="small" color="#ff6b6b" style={styles.deleteSpinner} />
      ) : (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteStudent(item.id)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Student Management</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter student name"
              value={name}
              onChangeText={setName}
              editable={!addingStudent}
            />
            <TouchableOpacity 
              style={[styles.addButton, addingStudent && styles.addButtonDisabled]}
              onPress={addStudent}
              disabled={addingStudent}
            >
              {addingStudent ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.loaderText}>Loading students...</Text>
            </View>
          ) : (
            <FlatList
              data={students}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              ListEmptyComponent={
                <Text style={styles.emptyList}>No students added yet.</Text>
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#0066cc',
    height: 50,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#7ab0e6',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  studentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  studentName: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyList: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  deleteSpinner: {
    width: 30,
    height: 30,
  },
});