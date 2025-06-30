import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Plus, Trash2, Settings, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Tipos para o Kanban
interface Tarefa {
  id: string;
  texto: string;
  descricao: string;
  prioridade: "baixa" | "media" | "alta";
  dataCriacao: string;
}

interface Coluna {
  id: string;
  titulo: string;
  corCabecalho: string;
  tarefas: Tarefa[];
}

interface Quadro {
  titulo: string;
  colunas: Coluna[];
}

interface ResultadoArrasto {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

const CORES_DISPONIVEIS = [
  "bg-slate-600",
  "bg-red-600",
  "bg-orange-600",
  "bg-amber-600",
  "bg-yellow-600",
  "bg-lime-600",
  "bg-green-600",
  "bg-emerald-600",
  "bg-teal-600",
  "bg-cyan-600",
  "bg-sky-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-purple-600",
  "bg-fuchsia-600",
  "bg-pink-600",
  "bg-rose-600",
];

const PRIORIDADES = [
  { valor: "baixa", texto: "Baixa", cor: "bg-green-500" },
  { valor: "media", texto: "Média", cor: "bg-yellow-500" },
  { valor: "alta", texto: "Alta", cor: "bg-red-500" },
];

export default function KanbanPage() {
  const [quadro, setQuadro] = useState<Quadro>({
    titulo: "Meu Quadro Kanban",
    colunas: [
      {
        id: uuidv4(),
        titulo: "A Fazer",
        corCabecalho: "bg-slate-600",
        tarefas: [],
      },
      {
        id: uuidv4(),
        titulo: "Em Progresso",
        corCabecalho: "bg-amber-600",
        tarefas: [],
      },
      {
        id: uuidv4(),
        titulo: "Concluído",
        corCabecalho: "bg-green-600",
        tarefas: [],
      },
    ],
  });

  const [tarefaSelecionada, setTarefaSelecionada] = useState<{
    tarefa: Tarefa | null;
    colunaIndex: number;
    tarefaIndex: number;
  }>({
    tarefa: null,
    colunaIndex: -1,
    tarefaIndex: -1,
  });

  const [novaTarefa, setNovaTarefa] = useState<{
    texto: string;
    descricao: string;
    prioridade: "baixa" | "media" | "alta";
    colunaIndex: number;
  }>({
    texto: "",
    descricao: "",
    prioridade: "media",
    colunaIndex: 0,
  });

  const [novaColuna, setNovaColuna] = useState({
    titulo: "",
    corCabecalho: "bg-slate-600",
  });

  const [editarQuadro, setEditarQuadro] = useState(false);
  const [tituloQuadro, setTituloQuadro] = useState(quadro.titulo);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const quadroSalvo = localStorage.getItem("kanbanQuadro");
    if (quadroSalvo) {
      try {
        setQuadro(JSON.parse(quadroSalvo));
      } catch (error) {
        console.error("Erro ao carregar o quadro:", error);
      }
    }
  }, []);

  // Salvar quadro no localStorage
  const salvarQuadro = () => {
    try {
      localStorage.setItem("kanbanQuadro", JSON.stringify(quadro));
      alert("Quadro salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar o quadro:", error);
      alert("Erro ao salvar o quadro. Verifique o console para mais detalhes.");
    }
  };

  // Adicionar nova coluna
  const adicionarColuna = () => {
    if (!novaColuna.titulo.trim()) return;

    const novasColumnas = [
      ...quadro.colunas,
      {
        id: uuidv4(),
        titulo: novaColuna.titulo,
        corCabecalho: novaColuna.corCabecalho,
        tarefas: [],
      },
    ];

    setQuadro({ ...quadro, colunas: novasColumnas });
    setNovaColuna({ titulo: "", corCabecalho: "bg-slate-600" });
  };

  // Remover uma coluna
  const removerColuna = (index: number) => {
    const novasColumnas = [...quadro.colunas];
    novasColumnas.splice(index, 1);
    setQuadro({ ...quadro, colunas: novasColumnas });
  };

  // Adicionar nova tarefa
  const adicionarTarefa = () => {
    if (!novaTarefa.texto.trim()) return;

    const novaTarefaObj: Tarefa = {
      id: uuidv4(),
      texto: novaTarefa.texto,
      descricao: novaTarefa.descricao,
      prioridade: novaTarefa.prioridade,
      dataCriacao: new Date().toISOString(),
    };

    const novasColumnas = [...quadro.colunas];
    novasColumnas[novaTarefa.colunaIndex].tarefas.push(novaTarefaObj);

    setQuadro({ ...quadro, colunas: novasColumnas });
    setNovaTarefa({
      texto: "",
      descricao: "",
      prioridade: "media",
      colunaIndex: 0,
    });
  };

  // Remover uma tarefa
  const removerTarefa = () => {
    if (
      tarefaSelecionada.colunaIndex >= 0 &&
      tarefaSelecionada.tarefaIndex >= 0
    ) {
      const novasColumnas = [...quadro.colunas];
      novasColumnas[tarefaSelecionada.colunaIndex].tarefas.splice(
        tarefaSelecionada.tarefaIndex,
        1
      );
      
      setQuadro({ ...quadro, colunas: novasColumnas });
      setTarefaSelecionada({
        tarefa: null,
        colunaIndex: -1,
        tarefaIndex: -1,
      });
    }
  };

  // Atualizar o título do quadro
  const atualizarTituloQuadro = () => {
    if (tituloQuadro.trim()) {
      setQuadro({ ...quadro, titulo: tituloQuadro });
      setEditarQuadro(false);
    }
  };

  // Lidar com o arrastar e soltar
  const onDragEnd = (result: ResultadoArrasto) => {
    const { source, destination } = result;

    // Se não há destino ou o destino é o mesmo que a origem, não fazer nada
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    // Clona o array de colunas
    const novasColumnas = [...quadro.colunas];

    // Encontra os índices das colunas fonte e destino
    const sourceColunaIndex = novasColumnas.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColunaIndex = novasColumnas.findIndex(
      (col) => col.id === destination.droppableId
    );

    // Obtém a tarefa a ser movida
    const tarefaMovida = {
      ...novasColumnas[sourceColunaIndex].tarefas[source.index],
    };

    // Remove a tarefa da coluna fonte
    novasColumnas[sourceColunaIndex].tarefas.splice(source.index, 1);

    // Adiciona a tarefa à coluna de destino
    novasColumnas[destColunaIndex].tarefas.splice(
      destination.index,
      0,
      tarefaMovida
    );

    // Atualiza o estado
    setQuadro({ ...quadro, colunas: novasColumnas });
  };

  // Exportar para JSON
  const exportarJSON = () => {
    const dadosJSON = JSON.stringify(quadro, null, 2);
    const blob = new Blob([dadosJSON], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = href;
    link.download = `${quadro.titulo.replace(/\s+/g, "_")}_kanban.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Importar de JSON
  const importarJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        const quadroImportado = JSON.parse(conteudo);
        
        // Validação básica
        if (
          quadroImportado &&
          quadroImportado.titulo &&
          Array.isArray(quadroImportado.colunas)
        ) {
          setQuadro(quadroImportado);
        } else {
          throw new Error("Formato de arquivo inválido");
        }
      } catch (error) {
        console.error("Erro ao importar arquivo:", error);
        alert("Erro ao importar arquivo. Verifique se o formato é válido.");
      }
    };
    reader.readAsText(file);
    
    // Limpar o valor do input para permitir selecionar o mesmo arquivo novamente
    event.target.value = "";
  };

  // Resetar o quadro para o estado inicial
  const resetarQuadro = () => {
    if (
      window.confirm(
        "Tem certeza que deseja resetar o quadro? Todas as informações serão perdidas."
      )
    ) {
      setQuadro({
        titulo: "Meu Quadro Kanban",
        colunas: [
          {
            id: uuidv4(),
            titulo: "A Fazer",
            corCabecalho: "bg-slate-600",
            tarefas: [],
          },
          {
            id: uuidv4(),
            titulo: "Em Progresso",
            corCabecalho: "bg-amber-600",
            tarefas: [],
          },
          {
            id: uuidv4(),
            titulo: "Concluído",
            corCabecalho: "bg-green-600",
            tarefas: [],
          },
        ],
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {editarQuadro ? (
              <div className="flex items-center gap-2">
                <Input
                  className="max-w-64 font-bold"
                  value={tituloQuadro}
                  onChange={(e) => setTituloQuadro(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={atualizarTituloQuadro}
                >
                  Salvar
                </Button>
              </div>
            ) : (
              <h1 className="text-2xl font-bold flex items-center">
                {quadro.titulo}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => setEditarQuadro(true)}
                >
                  <Settings size={16} />
                </Button>
              </h1>
            )}
          </div>

          {/* Ações do quadro */}
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus size={16} className="mr-1" /> Nova Coluna
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Coluna</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="titulo-coluna">Título</Label>
                    <Input
                      id="titulo-coluna"
                      value={novaColuna.titulo}
                      onChange={(e) =>
                        setNovaColuna({
                          ...novaColuna,
                          titulo: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cor do Cabeçalho</Label>
                    <div className="grid grid-cols-6 gap-2 mt-1">
                      {CORES_DISPONIVEIS.map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform",
                            cor,
                            novaColuna.corCabecalho === cor
                              ? "ring-2 ring-offset-2 ring-black scale-110"
                              : ""
                          )}
                          onClick={() =>
                            setNovaColuna({
                              ...novaColuna,
                              corCabecalho: cor,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogClose asChild>
                  <Button onClick={adicionarColuna}>Adicionar</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus size={16} className="mr-1" /> Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="titulo-tarefa">Título</Label>
                    <Input
                      id="titulo-tarefa"
                      value={novaTarefa.texto}
                      onChange={(e) =>
                        setNovaTarefa({
                          ...novaTarefa,
                          texto: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao-tarefa">Descrição</Label>
                    <Textarea
                      id="descricao-tarefa"
                      value={novaTarefa.descricao}
                      onChange={(e) =>
                        setNovaTarefa({
                          ...novaTarefa,
                          descricao: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prioridade-tarefa">Prioridade</Label>
                    <Select
                      value={novaTarefa.prioridade}
                      onValueChange={(valor: "baixa" | "media" | "alta") =>
                        setNovaTarefa({
                          ...novaTarefa,
                          prioridade: valor,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORIDADES.map((p) => (
                          <SelectItem key={p.valor} value={p.valor}>
                            <div className="flex items-center">
                              <span
                                className={cn(
                                  "w-3 h-3 rounded-full mr-2",
                                  p.cor
                                )}
                              ></span>
                              {p.texto}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="coluna-tarefa">Coluna</Label>
                    <Select
                      value={novaTarefa.colunaIndex.toString()}
                      onValueChange={(valor) =>
                        setNovaTarefa({
                          ...novaTarefa,
                          colunaIndex: parseInt(valor),
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione a coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        {quadro.colunas.map((coluna, index) => (
                          <SelectItem key={coluna.id} value={index.toString()}>
                            {coluna.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogClose asChild>
                  <Button onClick={adicionarTarefa}>Adicionar</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  Opções
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={salvarQuadro}
                  >
                    <Save size={16} className="mr-2" /> Salvar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={exportarJSON}
                  >
                    Exportar JSON
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() =>
                        document.getElementById("importar-json")?.click()
                      }
                    >
                      Importar JSON
                    </Button>
                    <input
                      id="importar-json"
                      type="file"
                      accept=".json"
                      onChange={importarJSON}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start"
                    onClick={resetarQuadro}
                  >
                    Resetar Quadro
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
            {quadro.colunas.map((coluna, colunaIndex) => (
              <div key={coluna.id} className="flex flex-col h-full">
                <Card className="w-full h-full flex flex-col">
                  <CardHeader className={cn(coluna.corCabecalho, "text-white")}>
                    <div className="flex justify-between items-center">
                      <CardTitle>{coluna.titulo}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                        onClick={() => removerColuna(colunaIndex)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <Droppable droppableId={coluna.id}>
                    {(provided) => (
                      <CardContent
                        className="flex-1 pt-6 overflow-y-auto"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {coluna.tarefas.length === 0 ? (
                          <p className="text-center text-muted-foreground text-sm py-8">
                            Nenhuma tarefa ainda
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {coluna.tarefas.map((tarefa, tarefaIndex) => (
                              <Draggable
                                key={tarefa.id}
                                draggableId={tarefa.id}
                                index={tarefaIndex}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <div className="bg-white shadow-sm border rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow">
                                          <div className="flex justify-between items-start">
                                            <h3 className="font-medium">
                                              {tarefa.texto}
                                            </h3>
                                            <span
                                              className={cn(
                                                "inline-block w-3 h-3 rounded-full",
                                                PRIORIDADES.find(
                                                  (p) => p.valor === tarefa.prioridade
                                                )?.cor
                                              )}
                                            ></span>
                                          </div>
                                          {tarefa.descricao && (
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                              {tarefa.descricao}
                                            </p>
                                          )}
                                        </div>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            {tarefa.texto}
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div>
                                            <h4 className="text-sm font-medium">
                                              Descrição
                                            </h4>
                                            <p className="text-sm mt-1">
                                              {tarefa.descricao || "Sem descrição"}
                                            </p>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium">
                                              Prioridade
                                            </h4>
                                            <div className="flex items-center mt-1">
                                              <span
                                                className={cn(
                                                  "inline-block w-3 h-3 rounded-full mr-2",
                                                  PRIORIDADES.find(
                                                    (p) => p.valor === tarefa.prioridade
                                                  )?.cor
                                                )}
                                              ></span>
                                              <span className="text-sm">
                                                {PRIORIDADES.find(
                                                  (p) => p.valor === tarefa.prioridade
                                                )?.texto}
                                              </span>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium">
                                              Data de Criação
                                            </h4>
                                            <p className="text-sm mt-1">
                                              {new Date(tarefa.dataCriacao).toLocaleDateString(
                                                "pt-BR",
                                                {
                                                  day: "2-digit",
                                                  month: "2-digit",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                }
                                              )}
                                            </p>
                                          </div>
                                          <div className="pt-4">
                                            <Button
                                              variant="destructive"
                                              onClick={() => {
                                                setTarefaSelecionada({
                                                  tarefa,
                                                  colunaIndex,
                                                  tarefaIndex,
                                                });
                                                removerTarefa();
                                              }}
                                            >
                                              <Trash2 size={16} className="mr-2" />
                                              Excluir Tarefa
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </CardContent>
                    )}
                  </Droppable>
                </Card>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Rodapé */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Gerador de Kanban - Desenvolvido com ❤️
        </div>
      </footer>
    </div>
  );
}