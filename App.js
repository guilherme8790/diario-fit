import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert,
  Button,
} from 'react-native';
import * as Database from './services/Database';
import Formulario from './components/Formulario';
import ListaRegistros from './components/ListaRegistros';
import Grafico from './components/Grafico';  // <-- Componente gráfico
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [ordenacao, setOrdenacao] = useState('recentes'); // controle de ordenação

  useEffect(() => {
    const init = async () => {
      const dados = await Database.carregarDados();
      setRegistros(dados);
      setCarregando(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!carregando) {
      Database.salvarDados(registros);
    }
  }, [registros, carregando]);

  const handleSave = (exercicio, calorias, agua) => {
    const exercicioNum = parseInt(exercicio, 10);
    const caloriasNum = parseInt(calorias, 10);
    const aguaNum = parseInt(agua, 10);

    if (aguaNum < 0 || exercicioNum < 0 || caloriasNum < 0) {
      return Alert.alert(
        'Erro de Validação',
        'Nenhum valor pode ser negativo. Por favor, corrija.'
      );
    }

    if (editingId) {
      const registrosAtualizados = registros.map((reg) =>
        reg.id === editingId
          ? { ...reg, exercicio: exercicioNum, calorias: caloriasNum, agua: aguaNum }
          : reg
      );
      setRegistros(registrosAtualizados);
      Alert.alert('Sucesso!', 'Seu registro foi atualizado!');
    } else {
      const novoRegistro = {
        id: new Date().getTime(),
        data: new Date().toLocaleDateString('pt-BR'),
        exercicio: exercicioNum,
        calorias: caloriasNum,
        agua: aguaNum,
      };
      setRegistros([...registros, novoRegistro]);
      Alert.alert('Sucesso!', 'Seu registro foi salvo!');
    }
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setRegistros(registros.filter((reg) => reg.id !== id));
    Alert.alert('Sucesso!', 'O registro foi deletado.');
  };

  const handleEdit = (registro) => {
    setEditingId(registro.id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const exportarDados = async () => {
    const fileUri = Database.fileUri;
    if (Platform.OS === 'web') {
      const jsonString = JSON.stringify(registros, null, 2);
      if (registros.length === 0) {
        return Alert.alert('Aviso', 'Nenhum dado para exportar.');
      }
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dados.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        return Alert.alert('Aviso', 'Nenhum dado para exportar.');
      }
      if (!(await Sharing.isAvailableAsync())) {
        return Alert.alert('Erro', 'Compartilhamento não disponível.');
      }
      await Sharing.shareAsync(fileUri);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // Ordenação da lista de registros
  let registrosOrdenados = [...registros];
  if (ordenacao === 'maior_agua') {
    registrosOrdenados.sort((a, b) => b.agua - a.agua); 
  } else {
    registrosOrdenados.sort((a, b) => b.id - a.id);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.titulo}>Meu Diário Fit</Text>

        {/* Gráfico: Exibindo todos os registros sem ordenação */}
        <Grafico registros={registros} />  {/* Passando todos os registros sem ordenação para o gráfico */}

        {/* Botões de ordenação */}
        <View style={styles.botoesOrdenacao}>
          <Button title="Mais Recentes" onPress={() => setOrdenacao('recentes')} />
          <Button title="Maior Valor (Água)" onPress={() => setOrdenacao('maior_agua')} />
        </View>

        {/* Formulário para inserção de dados */}
        <Formulario
          onSave={handleSave}
          onCancel={handleCancel}
          registroEmEdicao={registros.find((r) => r.id === editingId) || null}
        />

        {/* Lista de registros ordenada */}
        <ListaRegistros
          registros={registrosOrdenados}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <View style={styles.card}>
          <Text style={styles.subtitulo}>Exportar "Banco de Dados"</Text>
          <TouchableOpacity style={styles.botaoExportar} onPress={exportarDados}>
            <Text style={styles.botaoTexto}>Exportar arquivo dados.json</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: '#f0f4f7',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1e3a5f',
  },
  botoesOrdenacao: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 3,
  },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#34495e' },
  botaoExportar: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
