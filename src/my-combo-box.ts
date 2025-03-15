import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import "./components/my-badge";
import { MyDropdown } from "./components/my-dropdown";
import "./components/my-dropdown-item";
import { MyDropdownItem } from "./components/my-dropdown-item";
import styles from "./my-combo-box.scss";

type FilterFunction = (inputValue: string, menuItem: string) => boolean;

@customElement("my-combo-box")
export class MyComboBox extends MyDropdown {
  static styles = [MyDropdown.styles, styles];

  @query("#user-input") userInputElement: HTMLInputElement;

  /**The input's placeholder text. */
  @property({ type: String, reflect: true }) placeholder = "placeholder";

  /**The input's value attribute. */
  @property({ reflect: true, type: String }) value = "";

  /**The list of items to display in the dropdown. */
  @property({ type: Array }) menuList: string[] = [];

  /**The list of items to display in the dropdown. */
  @property()
  selectedItems: string[] = [];

  /**The function used to determine if a menu item should be shown in the menu list, given the user's input value. */
  @property()
  filterMenu: FilterFunction = (inputValue: string, menuItem: string) => {
    const itemLowerCase = menuItem.toLowerCase();
    const valueLower = inputValue.toLowerCase();

    // Filtering the list off when there is selected value
    return (
      itemLowerCase.startsWith(valueLower) &&
      !this.selectedItems.includes(menuItem)
    );
  };

  @state()
  filteredMenuList: string[] = [];

  private _handleInputKeyup(e: KeyboardEvent) {
    const KEYCODE_BACKSPACE = "backspace";
    
    if (!this.value && e.code.toLowerCase() === KEYCODE_BACKSPACE) {
      this.removeItem();
    }else {
      this.showMenu();
      this.value = (e.target as HTMLInputElement).value;
      this.filteredMenuList = this.menuList.filter((item) =>
        this.filterMenu(this.value, item)
      );
    }
  }

  private _handleSelectChange(e: KeyboardEvent | MouseEvent) {
    const selectedValue = (e.target as MyDropdownItem).innerText;
    this.value = "";
    this.selectedItems.push(selectedValue);
    this.userInputElement.focus();
    this._handleSelectSlot(e);
  }

  /** When clicked on any part of div-looking input, the embedded input is focus.  */
  private _handleToggleUserInput(e: CustomEvent) {
    e.stopPropagation();
    this._onClickDropdownToggle();
    this.userInputElement.focus();
  }

  private removeItem(index?: number) {
    if (index) {
      // When index is provided, remove by position
      this.selectedItems.splice(index, 1);
    } else {
      // When no index is passed over, we will pop the last one in list
      this.selectedItems.pop();
    }

    this.selectedItems = [...this.selectedItems];
  }

  private _handleRemoveBadge(e:MouseEvent) {
    const selectedIndex = (e.target as Element).getAttribute('key')!;
    this.removeItem(Number(selectedIndex))
  }

  render() {
    this.filteredMenuList = this.menuList.filter((item) =>
      this.filterMenu(this.value, item)
    );

    return html`
      <div class="combobox dropdown multiselect">
        <div
          @click=${this._handleToggleUserInput}
          ${ref(this.myDropdown)}
          class="form-control"
        >
          ${this.selectedItems.map(
            (item, index) => 
              html`<my-badge key=${index} @click=${this._handleRemoveBadge}>${item}</my-badge>`
          )}

          <input
            id="user-input"
            class="form-control-multiselect"
            type="text"
            @keyup=${this._handleInputKeyup}
            placeholder=${this.placeholder}
            .value=${this.value}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-search"
            viewBox="0 0 16 16"
          >
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
            />
          </svg>
        </div>
        <ul class="dropdown-menu" part="menu">
          ${this.filteredMenuList.length > 0
            ? this.filteredMenuList.map(
                (item) =>
                  html`<my-dropdown-item
                    href="javascript:void(0)"
                    @click=${this._handleSelectChange}
                    >${item}</my-dropdown-item
                  >`
              )
            : html`<em>No results found</em>`}
        </ul>
      </div>
    `;
  }
}

export default MyComboBox;
