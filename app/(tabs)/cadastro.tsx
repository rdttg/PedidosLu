import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

interface Pedido {
  id: string;
  nome: string;
  valor: string;
  descricao: string;
  dataEntrega: string;
  dataCadastro: string;
  status: 'Pendente' | 'Entregue';
  imagem: string | null;
}

export default function CadastroPedido() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Pega o ID enviado pela lista

  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  // 1. Efeito para carregar os dados caso seja uma EDIÇÃO
  useEffect(() => {
    if (id) {
      carregarDadosParaEdicao();
    }
  }, [id]);

  const carregarDadosParaEdicao = async () => {
    const dados = await AsyncStorage.getItem('@pedidos');
    if (dados) {
      const pedidos: Pedido[] = JSON.parse(dados);
      const pedidoParaEditar = pedidos.find(p => p.id === id);
      
      if (pedidoParaEditar) {
        setNome(pedidoParaEditar.nome);
        setValor(pedidoParaEditar.valor);
        setDescricao(pedidoParaEditar.descricao);
        setDataEntrega(pedidoParaEditar.dataEntrega);
        setImagem(pedidoParaEditar.imagem);
      }
    }
  };

  const aplicarMascaraData = (valor: string) => {
    
  const soNumeros = valor.replace(/\D/g, '');
  

  return soNumeros
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1');
};

  const selecionarImagem = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Erro", "Você precisa permitir o acesso às fotos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const salvarPedido = async () => {
    if (!nome || !valor) {
      Alert.alert("Aviso", "Por favor, preencha pelo menos o nome e o valor.");
      return;
    }

    try {
      const dadosExistentes = await AsyncStorage.getItem('@pedidos');
      let pedidosAtuais: Pedido[] = dadosExistentes ? JSON.parse(dadosExistentes) : [];

      if (id) {
        // 2. LÓGICA DE EDIÇÃO: Atualiza o item existente
        pedidosAtuais = pedidosAtuais.map(p => 
          p.id === id 
            ? { ...p, nome, valor, descricao, dataEntrega, imagem } 
            : p
        );
        Alert.alert("Sucesso!", "Pedido atualizado.");
      } else {
        // 3. LÓGICA DE NOVO: Cria um novo ID e objeto
        const novoPedido: Pedido = {
          id: Math.random().toString(36).substring(7),
          nome,
          valor,
          descricao,
          dataEntrega,
          dataCadastro: new Date().toLocaleDateString('pt-BR'),
          status: 'Pendente',
          imagem
        };
        pedidosAtuais.push(novoPedido);
        Alert.alert("Sucesso!", "Novo pedido cadastrado.");
      }

      await AsyncStorage.setItem('@pedidos', JSON.stringify(pedidosAtuais));
      router.replace('/'); 
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar o pedido.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{id ? "Editar Encomenda ✏️" : "Nova Encomenda 🪵"}</Text>

      <Text style={styles.label}>Nome do Cliente</Text>
      <TextInput style={styles.input} placeholder="Quem comprou?" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Valor da Plaquinha (R$)</Text>
      <TextInput style={styles.input} placeholder="Ex: 50,00" keyboardType="numeric" value={valor} onChangeText={setValor} />

      <Text style={styles.label}>Previsão de Entrega</Text>
<TextInput 
  style={styles.input} 
  placeholder="DD/MM/AAAA" 
  keyboardType="numeric"
  maxLength={10} // Impede de digitar mais que 10 caracteres
  value={dataEntrega} 
  onChangeText={(texto) => setDataEntrega(aplicarMascaraData(texto))} 
/>

      <Text style={styles.label}>Descrição / Detalhes da Arte</Text>
      <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Ex: Frase 'Lar Doce Lar'..." multiline value={descricao} onChangeText={setDescricao} />

      <TouchableOpacity style={styles.btnImage} onPress={selecionarImagem}>
        <Text style={styles.btnImageText}>{imagem ? "✅ Imagem Anexada" : "📸 Escolher Foto"}</Text>
      </TouchableOpacity>

      {imagem && <Image source={{ uri: imagem }} style={styles.preview} />}

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarPedido}>
        <Text style={styles.btnSalvarText}>{id ? "SALVAR ALTERAÇÕES" : "CADASTRAR PEDIDO"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.btnCancelar}>
        <Text style={{ color: '#666' }}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FDF5E6' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 30, color: '#5D2E0A' },
  label: { fontWeight: 'bold', color: '#5D2E0A', marginBottom: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D2B48C' },
  btnImage: { backgroundColor: '#DEB887', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  btnImageText: { color: '#5D2E0A', fontWeight: 'bold' },
  preview: { width: '100%', height: 250, borderRadius: 10, marginBottom: 15 },
  btnSalvar: { backgroundColor: '#8B4513', padding: 20, borderRadius: 10, alignItems: 'center' },
  btnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  btnCancelar: { marginTop: 20, marginBottom: 50, alignItems: 'center' }
});