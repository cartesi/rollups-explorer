import { Table } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FC } from "react";
import { Hex } from "viem";
import { describe, it } from "vitest";
import InputRow, { InputCardProps, decodePayload } from "../../src/components/inputRow";
import { InputItemFragment } from "../../src/graphql";
import withMantineTheme from "../utils/WithMantineTheme";
import { inputERC20Deposit } from "../utils/stubs/inputRowData";

const depositERC20Method = inputERC20Deposit as unknown as InputItemFragment
const Wrapper: FC<InputCardProps> = ({ input }) => {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>From</Table.Th>
          <Table.Th></Table.Th>
          <Table.Th>To</Table.Th>
          <Table.Th>Method</Table.Th>
          <Table.Th>Index</Table.Th>
          <Table.Th>Age</Table.Th>
          <Table.Th>Data</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <InputRow key={input.id} input={input} />
      </Table.Tbody>
    </Table>
  )
}
const InputRowE = withMantineTheme(Wrapper)
describe("InputRow Component", () => {
  afterEach(() => cleanup());

  describe("Input Method ERC20 Deposit", () => {
    it("should display a shorten version of the sender address", () => {
      const {container} = render(<InputRowE input={depositERC20Method} />)
      const tooltip = container.querySelector("p.mantine-focus-auto.mantine-Text-root") as Element
      fireEvent.mouseEnter(tooltip);
      const tooltipContent = screen.getByText("0x60247492F1538Ed4520e61aE41ca2A8447592Ff5");
      expect(tooltipContent).toBeInTheDocument()
      expect(screen.getByText("0x602474...592Ff5")).toBeInTheDocument()

    })
    it("should display the correct ERC20 token symbol and value", () => {
      render(<InputRowE input={depositERC20Method} />)
      expect(screen.getByText("3809 CTSI")).toBeInTheDocument()
    })
    it("should display the depositERC20Tokens method name", () => {
      render(<InputRowE input={depositERC20Method} />)
      expect(screen.getByText("depositERC20Tokens")).toBeInTheDocument()
    })
    it("should display the payload data tabs", async() => {
      const decode = decodePayload(depositERC20Method.payload as Hex)
      const {container} = render(<InputRowE input={depositERC20Method} />)
      const button = container.querySelector('.m-4e7aa4ef.mantine-Table-td:last-child > button') as Element
      await fireEvent.click(button)
      const text = container.querySelector('textarea.mantine-Input-input.mantine-Textarea-input')!.innerHTML 
      const asTextTabs = screen.getByText("As Text")
      expect(screen.getByText("Raw")).toBeInTheDocument()
      expect(screen.getByText("As Text")).toBeInTheDocument()
      expect(screen.getByText("As JSON")).toBeInTheDocument()
      expect(text).toBe(depositERC20Method.payload)
      await fireEvent.click(asTextTabs)
      expect(screen.getAllByText(decode)[0]).toBeInTheDocument()
    })
  })

})