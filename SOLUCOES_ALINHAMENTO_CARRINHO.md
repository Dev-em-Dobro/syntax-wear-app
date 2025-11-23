# Soluções para Corrigir Alinhamento do Ícone da Sacola

## Problema
O componente `ShoppingCart` retorna um fragment (`<>`) com múltiplos elementos (botão + overlay/drawer), afetando o alinhamento vertical no header.

---

## SOLUÇÃO 1: Separar em Componentes (CartButton + CartDrawer)

### Estrutura Final:
- `CartButton.tsx` - Apenas o botão (renderizado no Header)
- `CartDrawer.tsx` - Overlay + Drawer (renderizado no App ou Header)
- Gerenciar estado no Header ou criar Context

---

### Passo a Passo - Solução 1:

#### **Passo 1: Criar componente CartButton**

**Arquivo:** `src/components/CartButton/index.tsx` (NOVO)

```typescript
import IconCart from "@/assets/images/icon-cart.png";
import { useContext } from "react";
import { CartContext } from "../../contexts/CartContext";

interface CartButtonProps {
  onClick: () => void;
}

export const CartButton = ({ onClick }: CartButtonProps) => {
  const { cart } = useContext(CartContext);

  return (
    <button
      className="relative cursor-pointer"
      onClick={onClick}
    >
      <img src={IconCart} alt="Ícone carrinho de compras" />
      {cart.length > 0 && (
        <span className="absolute -top-3 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {cart.length}
        </span>
      )}
    </button>
  );
};
```

**Explicação:**
- Componente simples que recebe `onClick` como prop
- Apenas renderiza o botão com o badge
- Não gerencia estado próprio

---

#### **Passo 2: Criar componente CartDrawer**

**Arquivo:** `src/components/CartDrawer/index.tsx` (NOVO)

```typescript
import { useContext } from "react";
import { formatCurrency } from "../../utils/format-currency";
import { CartContext } from "../../contexts/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { cart, removeFromCart, incrementInCart, decrementInCart } =
    useContext(CartContext);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`${isOpen ? "bg-black/70 visible" : "bg-transparent invisible"} fixed top-0 bottom-0 left-0 right-0 z-50`}
        onClick={onClose}
      >
        {/* Drawer */}
        <div
          className={`${isOpen ? "translate-x-0" : "translate-x-full"} absolute top-0 right-0 bottom-0 bg-white pt-6 transition-all duration-500 ease-in-out w-75 md:w-100`}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between px-5">
            <p className="text-2xl font-bold">Carrinho ({cart.length})</p>
            <button
              className="text-xl cursor-pointer"
              onClick={onClose}
            >
              X
            </button>
          </header>

          <ul className="p-4 overflow-y-auto scrollbar-hide h-[calc(100%_-_140px)] flex flex-col gap-3">
            {cart.map((product) => (
              <li key={product.id} className="flex flex-col gap-1 pr-2">
                <button
                  className="self-end text-xs cursor-pointer"
                  onClick={() => removeFromCart(product.id)}
                >
                  X
                </button>

                <div className="flex gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 md:w-32 md:h-32"
                  />

                  <div className="flex flex-col items-start">
                    <p className="mb-1 text-sm">{product.name}</p>
                    <p className="mb-1 text-sm">
                      Quantidade: {product.quantity}
                    </p>

                    <p className="mb-3.5">
                      <span className="font-bold mr-1.5">
                        {formatCurrency(product.price)}
                      </span>{" "}
                      à vista
                    </p>

                    <div className="border flex gap-6 py-1 px-3">
                      <button
                        className="cursor-pointer"
                        onClick={() => decrementInCart(product)}
                      >
                        -
                      </button>
                      <p>{product.quantity}</p>
                      <button
                        className="cursor-pointer"
                        onClick={() => incrementInCart(product)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <footer className="absolute bottom-0 w-full h-[100px] p-4">
            <button className="w-full h-full bg-black text-white rounded-xs cursor-pointer hover:bg-gray-800">
              Fechar pedido
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};
```

**Explicação:**
- Recebe `isOpen` e `onClose` como props
- Retorna `null` se não estiver aberto
- Toda a lógica do drawer isolada aqui

---

#### **Passo 3: Atualizar Header para gerenciar estado**

**Arquivo:** `src/components/Header/index.tsx`

**Mudanças:**
1. Adicionar `useState` para controlar abertura do drawer
2. Importar `CartButton` e `CartDrawer`
3. Renderizar `CartButton` no `<li>`
4. Renderizar `CartDrawer` fora do `<ul>` (no nível do header)

**Código completo:**

```typescript
import Logo from "@/assets/images/logo.png";
import IconUser from "@/assets/images/icon-user.png";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CartButton } from "../CartButton";
import { CartDrawer } from "../CartDrawer";
import { MenuMobile } from "../MenuMobile";

export interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Masculino", href: "/products/category/masculino" },
  { name: "Feminino", href: "/products/category/feminino" },
  { name: "Outlet", href: "/products/category/outlet" },
];

export const Header = () => {
  const [cartIsOpen, setCartIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <header className="fixed top-5 left-0 right-0 z-10 mx-10">
        <div className="bg-white text-black max-w-[1320px] mx-auto flex justify-between items-center py-3 px-7 rounded-2xl mt-5">
          <Link to="/">
            <img src={Logo} alt="Logo SyntaxWear" className="w-32 md:w-36" />
          </Link>

          <nav className="hidden lg:block">
            <ul className="flex gap-10">
              {navLinks.map((link) => (
                <Link to={link.href} key={link.name}>
                  {link.name}
                </Link>
              ))}
            </ul>
          </nav>

          <nav>
            <ul className="flex gap-4 md:gap-10 items-center">
              <li className="hidden lg:block">
                <Link to="/our-stores">Nossas lojas</Link>
              </li>
              <li className="hidden lg:block">
                <Link to="/about">Sobre</Link>
              </li>
              <li className="lg:hidden">
                <MenuMobile navLinks={navLinks} />
              </li>
              <li className="hidden lg:block">
                <Link to="/sign-up">
                  <img src={IconUser} alt="Ícone de login" />
                </Link>
              </li>
              <li>
                <CartButton onClick={() => setCartIsOpen(true)} />
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      {/* Drawer renderizado fora do fluxo do header */}
      <CartDrawer isOpen={cartIsOpen} onClose={() => setCartIsOpen(false)} />
    </div>
  );
};
```

**Explicação:**
- Estado `cartIsOpen` gerenciado no Header
- `CartButton` renderizado dentro do `<li>` (afeta layout)
- `CartDrawer` renderizado fora do `<ul>` (não afeta layout)
- Drawer usa `fixed` positioning, então funciona mesmo fora do header

---

#### **Passo 4: Remover componente ShoppingCart antigo**

**Arquivo:** `src/components/ShoppingCart/index.tsx` (DELETAR ou MANTER como wrapper)

**Opção A:** Deletar completamente
**Opção B:** Manter como wrapper (para não quebrar imports):

```typescript
// ShoppingCart/index.tsx - Wrapper para compatibilidade
import { CartButton } from "../CartButton";
import { CartDrawer } from "../CartDrawer";
import { useState } from "react";

export const ShoppingCart = () => {
  const [cartIsOpen, setCartIsOpen] = useState<boolean>(false);

  return (
    <>
      <CartButton onClick={() => setCartIsOpen(true)} />
      <CartDrawer isOpen={cartIsOpen} onClose={() => setCartIsOpen(false)} />
    </>
  );
};
```

**Recomendação:** Opção B se houver outros lugares usando `ShoppingCart`

---

### Vantagens da Solução 1:
- ✅ Separação clara de responsabilidades
- ✅ Botão não afeta layout (apenas ele no `<li>`)
- ✅ Drawer pode ser reutilizado em outros lugares
- ✅ Código mais testável
- ✅ Fácil de manter

---

## SOLUÇÃO 2: Ajustar CSS (Renderização Condicional)

### Estrutura Final:
- Manter `ShoppingCart` como está
- Apenas ajustar estrutura HTML/CSS
- Renderizar overlay/drawer condicionalmente

---

### Passo a Passo - Solução 2:

#### **Passo 1: Refatorar ShoppingCart para estrutura melhor**

**Arquivo:** `src/components/ShoppingCart/index.tsx`

**Mudanças:**
1. Envolver tudo em uma `<div>` com `relative`
2. Botão sempre renderizado (afeta layout)
3. Overlay/Drawer renderizado condicionalmente (não afeta layout quando fechado)
4. Usar `position: fixed` no overlay para sair do fluxo

**Código completo:**

```typescript
import IconCart from "@/assets/images/icon-cart.png";
import { useState, useContext } from "react";
import { formatCurrency } from "../../utils/format-currency";
import { CartContext } from "../../contexts/CartContext";

export const ShoppingCart = () => {
  const [cartIsOpen, setCartIsOpen] = useState<boolean>(false);
  const { cart, removeFromCart, incrementInCart, decrementInCart } =
    useContext(CartContext);

  return (
    <div className="relative">
      {/* Botão - sempre renderizado, afeta o layout */}
      <button
        className="relative cursor-pointer"
        onClick={() => setCartIsOpen(!cartIsOpen)}
      >
        <img src={IconCart} alt="Ícone carrinho de compras" />
        {cart.length > 0 && (
          <span className="absolute -top-3 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {cart.length}
          </span>
        )}
      </button>

      {/* Overlay + Drawer - renderizado condicionalmente, não afeta layout */}
      {cartIsOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setCartIsOpen(false)}
          >
            {/* Drawer */}
            <div
              className="absolute top-0 right-0 bottom-0 bg-white pt-6 transition-all duration-500 ease-in-out w-75 md:w-100 translate-x-0"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex items-center justify-between px-5">
                <p className="text-2xl font-bold">Carrinho ({cart.length})</p>
                <button
                  className="text-xl cursor-pointer"
                  onClick={() => setCartIsOpen(false)}
                >
                  X
                </button>
              </header>

              <ul className="p-4 overflow-y-auto scrollbar-hide h-[calc(100%_-_140px)] flex flex-col gap-3">
                {cart.map((product) => (
                  <li key={product.id} className="flex flex-col gap-1 pr-2">
                    <button
                      className="self-end text-xs cursor-pointer"
                      onClick={() => removeFromCart(product.id)}
                    >
                      X
                    </button>

                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 md:w-32 md:h-32"
                      />

                      <div className="flex flex-col items-start">
                        <p className="mb-1 text-sm">{product.name}</p>
                        <p className="mb-1 text-sm">
                          Quantidade: {product.quantity}
                        </p>

                        <p className="mb-3.5">
                          <span className="font-bold mr-1.5">
                            {formatCurrency(product.price)}
                          </span>{" "}
                          à vista
                        </p>

                        <div className="border flex gap-6 py-1 px-3">
                          <button
                            className="cursor-pointer"
                            onClick={() => decrementInCart(product)}
                          >
                            -
                          </button>
                          <p>{product.quantity}</p>
                          <button
                            className="cursor-pointer"
                            onClick={() => incrementInCart(product)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className="absolute bottom-0 w-full h-[100px] p-4">
                <button className="w-full h-full bg-black text-white rounded-xs cursor-pointer hover:bg-gray-800">
                  Fechar pedido
                </button>
              </footer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
```

**Principais mudanças:**

1. **Envolver em `<div className="relative">`**
   - Cria contexto de posicionamento
   - Apenas o botão afeta o layout do `<li>`

2. **Renderização condicional `{cartIsOpen && ...}`**
   - Overlay/Drawer só existe no DOM quando aberto
   - Quando fechado, não afeta layout

3. **`fixed inset-0` no overlay**
   - `fixed` remove do fluxo normal
   - `inset-0` = `top-0 right-0 bottom-0 left-0`
   - Cobre toda a tela

4. **Remover classes condicionais desnecessárias**
   - `translate-x-0` sempre aplicado (drawer sempre visível quando renderizado)
   - Simplifica o código

---

#### **Passo 2: Verificar se Header precisa ajustes**

**Arquivo:** `src/components/Header/index.tsx`

**Nenhuma mudança necessária!** O componente `ShoppingCart` já funciona corretamente.

**Verificação:**
- O `<li>` contém apenas o componente `ShoppingCart`
- Quando fechado, apenas o botão é renderizado
- Quando aberto, overlay usa `fixed` e não afeta layout

---

### Vantagens da Solução 2:
- ✅ Mudança mínima no código
- ✅ Não precisa criar novos componentes
- ✅ Funciona imediatamente
- ✅ Menos arquivos para gerenciar
- ✅ Mantém lógica unificada

---

## Comparação das Soluções

| Aspecto | Solução 1 (Separar) | Solução 2 (CSS) |
|---------|---------------------|------------------|
| **Complexidade** | Média (cria 2 componentes) | Baixa (ajuste CSS) |
| **Arquivos** | +2 arquivos novos | 0 arquivos novos |
| **Manutenibilidade** | Alta (separação clara) | Média (tudo junto) |
| **Reutilização** | Alta (drawer reutilizável) | Baixa (tudo acoplado) |
| **Tempo de implementação** | ~15-20 min | ~5 min |
| **Recomendação** | Projetos grandes | Projetos pequenos/médios |

---

## Recomendação Final

**Para este projeto:** Use **Solução 2** (ajuste CSS)
- Mais rápida de implementar
- Resolve o problema imediatamente
- Menos refatoração necessária
- Código mais simples de entender

**Para projetos maiores:** Use **Solução 1** (separar componentes)
- Melhor organização
- Mais fácil de testar
- Componentes reutilizáveis
- Escalabilidade melhor

---

## Checklist de Implementação

### Solução 1:
- [ ] Criar `src/components/CartButton/index.tsx`
- [ ] Criar `src/components/CartDrawer/index.tsx`
- [ ] Atualizar `src/components/Header/index.tsx`
- [ ] Remover ou adaptar `src/components/ShoppingCart/index.tsx`
- [ ] Testar abertura/fechamento do drawer
- [ ] Verificar alinhamento vertical

### Solução 2:
- [ ] Refatorar `src/components/ShoppingCart/index.tsx`
- [ ] Adicionar `<div className="relative">` wrapper
- [ ] Mudar para renderização condicional `{cartIsOpen && ...}`
- [ ] Ajustar classes CSS do overlay para `fixed inset-0`
- [ ] Testar abertura/fechamento do drawer
- [ ] Verificar alinhamento vertical

