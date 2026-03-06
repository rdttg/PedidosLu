import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState('');
  const router = useRouter();

  const carregarPedidos = async () => {
    try {
      const dados = await AsyncStorage.getItem('@pedidos'); //a
      if (dados) setPedidos(JSON.parse(dados));
    } catch (e) {
      console.error("Erro ao carregar");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarPedidos();
    }, [])
  );

  const alternarStatus = async (id: string) => {
    const novosPedidos = pedidos.map(p => {
      if (p.id === id) {
        const novoStatus = p.status === 'Entregue' ? 'Pendente' : 'Entregue';
        return { ...p, status: novoStatus as 'Entregue' | 'Pendente' };
      }
      return p;
    });
    setPedidos(novosPedidos);
    await AsyncStorage.setItem('@pedidos', JSON.stringify(novosPedidos));
  };

  const excluirPedido = async (id: string) => {
    const confirmar = window.confirm("Deseja realmente apagar este pedido?");
    if (confirmar) {
      const filtrados = pedidos.filter(p => p.id !== id);
      setPedidos(filtrados);
      await AsyncStorage.setItem('@pedidos', JSON.stringify(filtrados));
    }
  };


  const pedidosFiltrados = pedidos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🪵 Minhas Plaquinhas</Text>

      {}
      <TextInput
        style={styles.buscaInput}
        placeholder="🔍 Buscar cliente..."
        value={busca}
        onChangeText={setBusca}
      />
      
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {}
            <View style={styles.imageContainer}>
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={styles.miniatura} />
              ) : (
                <View style={[styles.miniatura, styles.semImagem]}>
                  <Text style={{fontSize: 10, color: '#D2B48C'}}>S/ Foto</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={{ flex: 1, paddingLeft: 10 }} 
              onPress={() => router.push({ pathname: '/cadastro', params: { id: item.id } })}
            >
              <Text style={styles.nomePedido} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.texto}>💰 R$ {item.valor}</Text>
              <Text style={styles.texto}>📅 {item.dataEntrega}</Text>
              <Text style={item.status === 'Entregue' ? styles.entregue : styles.pendente}>
                ● {item.status}
              </Text>
            </TouchableOpacity>

            <View style={styles.painelAcoes}>
              <TouchableOpacity 
                style={[styles.btnAcao, { backgroundColor: item.status === 'Entregue' ? '#666' : '#2E7D32' }]} 
                onPress={() => alternarStatus(item.id)}
              >
                <Text style={styles.btnAcaoTexto}>
                  {item.status === 'Entregue' ? 'Voltar' : 'Concluir'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btnAcao, { backgroundColor: '#d32f2f', marginTop: 5 }]} 
                onPress={() => excluirPedido(item.id)}
              >
                <Text style={styles.btnAcaoTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum pedido encontrado.</Text>}
      />

      <Link href={"/cadastro" as any} asChild>
        <TouchableOpacity style={styles.fab}><Text style={styles.fabText}>+</Text></TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FDF5E6' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, marginTop: 40, color: '#5D2E0A' },
  buscaInput: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#D2B48C',
    fontSize: 16
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 12, 
    marginBottom: 12, 
    flexDirection: 'row', 
    elevation: 3, 
    alignItems: 'center' 
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5'
  },
  miniatura: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  semImagem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed'
  },
  nomePedido: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  texto: { color: '#666', fontSize: 12, marginVertical: 1 },
  entregue: { color: '#2E7D32', fontWeight: 'bold', fontSize: 11 },
  pendente: { color: '#EF6C00', fontWeight: 'bold', fontSize: 11 },
  painelAcoes: { marginLeft: 5 },
  btnAcao: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, minWidth: 75, alignItems: 'center' },
  btnAcaoTexto: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 25, bottom: 25, backgroundColor: '#8B4513', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 30 },
  vazio: { textAlign: 'center', marginTop: 50, color: '#999' }
});