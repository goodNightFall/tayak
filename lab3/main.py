import re
import sys
from collections import namedtuple

Fargs = namedtuple("Fargs", ["s", "p", "h"])
Value = namedtuple("Value", ["s", "c"])

class Link:
    def __init__(self, s, inp, stack, term=False):
        self.s = s
        self.inp = inp
        self.stack = stack
        self.index = -1
        self.term = term

class Command:
    def __init__(self, f, values):
        self.f = f
        self.values = values

class Storage:
    def __init__(self, filename):
        self.P = set()
        self.H = set()
        self.s0 = '0'
        self.h0 = '|'
        self.empty_symbol = ''
        self.commands = []
        self.chain = []

        try:
            with open(filename, 'r') as file:
                pattern = re.compile(r"([A-Z])>([^\|]+(?:\|[^\|]+)*)")
                for line in file:
                    line = line.strip()
                    if not line:
                        continue
                    match = pattern.match(line)
                    if not match:
                        raise RuntimeError("Не удалось распознать содержимое файла")
                    symbol, transitions = match.groups()
                    self.H.add(symbol)
                    command = Command(Fargs(self.s0, self.empty_symbol, symbol), [])
                    values = transitions.split('|')
                    for val in values:
                        self.P.update(val)
                        command.values.append(Value(self.s0, val[::-1]))
                    self.commands.append(command)

                for c in self.H:
                    self.P.discard(c)

                for c in self.P:
                    self.commands.append(Command(Fargs(self.s0, c, c), [Value(self.s0, self.empty_symbol)]))
                self.commands.append(Command(Fargs(self.s0, self.empty_symbol, self.h0), [Value(self.s0, self.empty_symbol)]))

        except FileNotFoundError:
            raise RuntimeError("Не удалось открыть файл для чтения")

    def show_info(self):
        print("Входной алфавит:\nP = {", ', '.join(self.P), "}\n")
        print("Алфавит магазинных символов:\nZ = {", ', '.join(self.H | self.P), ", h0}\n")
        print("Список команд:")
        for cmd in self.commands:
            p = 'lambda' if cmd.f.p == self.empty_symbol else cmd.f.p
            h = 'h0' if cmd.f.h == self.h0 else cmd.f.h
            values_str = "; ".join(f"(s{v.s}, {'lambda' if v.c == self.empty_symbol else v.c})" for v in cmd.values)
            print(f"f(s{cmd.f.s}, {p}, {h}) = {{{values_str}}}")

    def show_chain(self):
        print("\nЦепочка конфигураций: ")
        for link in self.chain:
            inp_str = "lambda" if not link.inp else link.inp
            print(f"(s{link.s}, {inp_str}, h0{link.stack}) |– ", end="")
        print("(s0, lambda, lambda)")

    def push_link(self):
        ch_size = len(self.chain)
        for cmd in self.commands:
            mag_size = len(self.chain[-1].stack)
            last_link = self.chain[-1]
            if (last_link.inp and last_link.stack and
                last_link.s == cmd.f.s and
                (last_link.inp[0] == cmd.f.p or cmd.f.p == self.empty_symbol) and
                last_link.stack[-1] == cmd.f.h):

                for val in cmd.values:
                    new_link = Link(val.s, last_link.inp, last_link.stack)
                    if cmd.f.p != self.empty_symbol:
                        new_link.inp = new_link.inp[1:]

                    new_link.stack = new_link.stack[:-1] + val.c
                    self.chain.append(new_link)

                    if len(new_link.inp) < len(new_link.stack):
                        self.chain.pop()
                        continue

                    if (not new_link.inp and not new_link.stack) or self.push_link():
                        return True

                self.chain.pop()
                return False
        return False

    def check_line(self, input_str):
        if len(self.commands[0].values) == 1:
            self.chain.append(Link(self.s0, input_str, "", False))
        else:
            self.chain.append(Link(self.s0, input_str, "", True))

        self.chain[0].stack += self.commands[0].f.h
        result = self.push_link()

        if result:
            print("Валидная строка")
            self.show_chain()
        else:
            print("Невалидная строка")

        self.chain.clear()
        return result

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Укажите имя файла в качестве аргумента командной строки")
        sys.exit(1)

    try:
        storage = Storage(sys.argv[1])
        storage.show_info()
        while True:
            user_input = input("Введите строку: ")
            storage.check_line(user_input)
            print()
    except RuntimeError as e:
        print(e)
