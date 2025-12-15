import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  addLabel?: string;
  pageSize?: number;
  getRowId: (item: T) => string;
}

export default function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  onAdd,
  onEdit,
  onDelete,
  onView,
  addLabel = "Agregar",
  pageSize = 10,
  getRowId,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = data.filter((item) =>
    Object.values(item as object).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {onAdd && (
            <Button size="sm" onClick={onAdd} data-testid="button-add">
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={column.className}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {column.header}
                  </span>
                </TableHead>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-32 text-center text-muted-foreground"
                >
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={getRowId(item)} className="hover-elevate" data-testid={`row-${getRowId(item)}`}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key as string] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${getRowId(item)}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              Ver detalles
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              Editar
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="text-destructive"
                            >
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t text-sm text-muted-foreground">
        <span>
          Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredData.length)} de {filteredData.length} registros
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Badge variant="secondary">
            {page} / {totalPages || 1}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            data-testid="button-next-page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
