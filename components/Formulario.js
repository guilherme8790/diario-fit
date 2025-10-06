import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function Formulario({ onSave, onCancel, registroEmEdicao }) {
  const [coposAgua, setCoposAgua] = useState('');
  const [minutosExercicio, setMinutosExercicio] = useState('');
  const [calorias, setCalorias] = useState('');

  useEffect(() => {
    if (registroEmEdicao) {
      setMinutosExercicio(String(registroEmEdicao.exercicio));
      setCalorias(String(registroEmEdicao.calorias));
      setCoposAgua(String(registroEmEdicao.agua));
    } else {
      setMinutosExercicio('');
      setCalorias('');
      setCoposAgua('');
    }
  }, [registroEmEdicao]);

  const handleSaveClick = () => {
    onSave(minutosExercicio, calorias, coposAgua);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.subtitulo}>
        {registroEmEdicao ? 'Editando Registro (Update)' : 'Novo Registro (Create)'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Minutos Exercício"
        keyboardType="numeric"
        value={minutosExercicio}
        onChangeText={setMinutosExercicio}
      />
      <TextInput
        style={styles.input}
        placeholder="Calorias"
        keyboardType="numeric"
        value={calorias}
        onChangeText={setCalorias}
      />
      <TextInput
        style={styles.input}
        placeholder="Copos de água"
        keyboardType="numeric"
        value={coposAgua}
        onChangeText={setCoposAgua}
      />
      <TouchableOpacity style={styles.botao} onPress={handleSaveClick}>
        <Text style={styles.botaoTexto}>
          {registroEmEdicao ? 'Atualizar Registro' : 'Gravar no Arquivo'}
        </Text>
      </TouchableOpacity>

      {registroEmEdicao && (
        <TouchableOpacity style={styles.botaoCancelar} onPress={onCancel}>
          <Text style={styles.botaoTexto}>Cancelar Edição</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginHorizontal: 15, marginBottom: 20, elevation: 3 },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#34495e' },
  input: { borderWidth: 1, borderColor: '#cccccc', borderRadius: 5, padding: 12, fontSize: 16, marginBottom: 10 },
  botao: { backgroundColor: '#3498db', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 5 },
  botaoTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { backgroundColor: '#7f8c8d', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
});
