import React, { useRef, useState, useEffect } from "react";
import { Checkbox } from "./Checkbox";
import * as Colors from './Colors';
import "./Dropdown.css";
import "./font.css";
import { fuzzyIncludes } from "../tools/StringUtils"
import { distinctValues } from "../tools/ArrayUtils"
import { SearchBox } from "./SearchBox";

export interface DropdownOption {
    label: string;
    value: string | number;
}

/**
 * Props for the Dropdown component.
 */
export interface DropdownProps {
    /**
     * Array of options to display in the dropdown.
     */
    options: DropdownOption[];

    /**
     * Currently selected key(s). For single-select, use a string or number. For multi-select, use an array.
     */
    selectedKeys?: string | number | Array<string | number>;

    /**
     * Called when selection changes. Passes the new value(s).
     */
    onChange: (value: string | number | Array<string | number>) => void;

    /**
     * Text to show when nothing is selected.
     * @default "Select..."
     */
    placeholder?: string;

    /**
     * If true, disables the dropdown and prevents interaction.
     * @default false
     */
    disabled?: boolean;

    /**
     * Additional class name(s) to apply to the dropdown container.
     */
    className?: string;

    /**
     * Inline styles for the dropdown container.
     */
    style?: React.CSSProperties;

    /**
     * Enable multiple selection.
     * @default false
     */
    multiSelect?: boolean;

    /**
     * If true, shows a 'Select All' checkbox at the top of the options list (multi-select only).
     * @default false
     */
    showSelectAll?: boolean;

    /**
     * Label text for the 'Select All' checkbox.
     * @default "Select All"
     */
    selectAllLabel?: string;

    /**
     * Label text for the 'Select All' checkbox.
     * @default "Deselect All"
     */
    deselectAllLabel?: string;

    /**
     * Background color for the dropdown menu.
     */
    menuBgColor?: string;

    /**
     * Border color for the dropdown menu.
     */
    menuBorderColor?: string;

    /**
     * Text color for menu items.
     */
    menuTextColor?: string;

    /**
     * Font color for dropdown trigger and menu items.
     */
    fontColor?: string;

    /**
     * Background color for hovered menu items.
     */
    hoverColor?: string;

    /**
     * Label for the "Only" button in multi-select mode.
     * @default "Only"
     */
    onlyLabel?: string;

    /**
     * Accent color for checkboxes and highlight (light mode).
     */
    accentColorLightMode?: string;

    /**
     * Accent color for checkboxes and highlight (dark mode).
     */
    accentColorDarkMode?: string;

    /**
     * Override accent color for all modes.
     */
    accentColor?: string;

    /**
     * Maximum number of selected items to display in the trigger before showing "+N".
     * @default 2
     */
    maxDisplaySelect?: number;

    /**
     * Maximum height of the dropdown menu. Scrollbar appears if exceeded.
     * @default "300px"
     */
    maxOptionsHeight?: string;

    /**
     * Render the dropdown in dark mode.
     * @default false
     */
    darkMode?: boolean;

    /**
     * Enables search function of dropdown.
     */
    searchable?: boolean;

    /**
     * Color for clear x button on search.
     */
    xButtonColor?: string;

    /**
     * Label for main dropdown.
     */
    label?: string;

    backgroundColor?: string;

    isOpen?: boolean;                     // controlled
  onOpenChange?: (open: boolean) => void;

  placeholderColor?: string
}

const DropdownMenu: React.FC<{
    style: React.CSSProperties;
    children: React.ReactNode;
    // accentColor?: string;
    foregroundColor: string;
}> = ({ style, children, foregroundColor }) => (
    <div
        style={{
            ...style,
            '--foregroundColor': foregroundColor
        } as React.CSSProperties}
        className="dropdown-menu"
    >
        {children}
    </div>
);

const DropdownSelectAll: React.FC<{
    checked: boolean; label: string; accentColor: string; bg: string; hover: boolean; menuTextColor: string; darkMode: boolean;
    onHover: (hover: boolean) => void;
    onChange: () => void;
}> = ({ checked, label, accentColor, bg, hover, menuTextColor, darkMode, onHover, onChange }) => (
    <div
        style={{
            cursor: "pointer",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            color: menuTextColor,
            background: hover ? bg : "inherit",
            userSelect: "none",
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onChange}
    >
        <Checkbox
            checked={checked}
            tabIndex={-1}
            accentColor={accentColor}
            style={{ marginRight: 4 }}
            hovered={hover}
            darkMode={darkMode}
            onChange={e => {
                e.stopPropagation();
                onChange();
            }}
        />
        <span style={{fontStyle:"italic"}}>{label}</span>
    </div>
);

const DropdownOptionRow: React.FC<{
    option: DropdownOption; checked: boolean; multiSelect: boolean; accentColor: string; hovered: boolean; onlyLabel: string; menuTextColor: string; bg: string; darkMode: boolean;
    onHover: (hover: boolean) => void;
    onSelect: () => void;
    onOnly: (e: React.MouseEvent) => void;
}> = ({
    option, checked, multiSelect, accentColor, hovered: hovered, onlyLabel, menuTextColor, bg, darkMode,
    onHover, onSelect, onOnly
}) => (
        <div
            style={{
                cursor: "pointer",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                width: "100%",
                boxSizing: "border-box",
                background: bg,
                color: menuTextColor,
                userSelect: "none",
            }}
            onClick={onSelect}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
        >

            <Checkbox
                checked={checked}
                isRadioButton={!multiSelect}
                accentColor={accentColor}
                hovered={hovered}
                tabIndex={-1}
                darkMode={darkMode}
                style={{ marginRight: 4 }}
                onChange={e => {
                    e.stopPropagation();
                    onSelect();
                }}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flex: 1,
                    minWidth: 0,
                    gap: 0,
                }}
            >
                <span
                    style={{
                        textAlign: "left",
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        // overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {option.label}
                </span>
                {multiSelect &&
                    (hovered ? (
                        <button className="dropdown-only-btn"
                            style={{
                                marginLeft: 8,
                                fontSize: "0.85em",
                                fontWeight: "bold",
                                background: "none",
                                border: "none",
                                borderRadius: 999,
                                cursor: "pointer",
                                padding: "3px 20px",
                                transition: "background 0.15s",
                                color: accentColor,
                                minWidth: 40,
                                textAlign: "center",
                                height: "100%",
                            }}
                            tabIndex={-1}
                            onClick={onOnly}
                            type="button"
                            onMouseOver={e => {
                                e.currentTarget.style.background = accentColor + "2A";
                            }}
                            onMouseOut={e => (e.currentTarget.style.background = "none")}
                        >
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                {onlyLabel}
                            </span>
                        </button>

                    ) : (
                        <span
                            style={{
                                minWidth: 40,
                                marginLeft: 8,
                                display: "inline-block",
                                visibility: "hidden",
                                textAlign: "center",
                            }}
                        >
                            {onlyLabel}
                        </span>
                    ))}
            </div>
        </div>
    );

export const Dropdown: React.FC<DropdownProps> = ({
    options,
    selectedKeys,
    onChange,
    placeholder,
    disabled = false,
    className = "",
    style,
    multiSelect = false,
    showSelectAll = false,
    selectAllLabel,
    deselectAllLabel,
    menuBgColor,
    menuBorderColor,
    backgroundColor,
    fontColor,
    onlyLabel,
    accentColorLightMode,
    accentColorDarkMode,
    accentColor,
    maxDisplaySelect = 3,
    maxOptionsHeight = "200px",
    hoverColor,
    darkMode = false,
    searchable = false,
    xButtonColor, label, isOpen, onOpenChange, placeholderColor
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = isOpen ?? uncontrolledOpen;
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const Width = style?.width ?? 400;
    // const [selectAllText, setSelectAllText] = useState(selectAllLabel);

    const setOpen = (next: boolean) => {
        onOpenChange?.(next);
        if (isOpen === undefined) setUncontrolledOpen(next);
    };

    const toggleOpen = () => setOpen(!open);

    const PlaceHolder = placeholder ?? (searchable ? "Search..." : "Select...");
    const SelectAllLabel = selectAllLabel ?? "Select All";
    const DeselectAllLabel = deselectAllLabel ?? "Deselect All";
    const OnlyLabel = onlyLabel ?? "Only";

    const { MidnightGray, LightGray, HoverDarkMenu, HoverLightMenu, SoftBlue, TrueBlue } = Colors;

    const MenuColor = menuBgColor ?? backgroundColor ?? (darkMode ? MidnightGray : LightGray)
    const MenuBorder = menuBorderColor ?? (darkMode ? LightGray : MidnightGray);
    const FontColor = fontColor ?? (darkMode ? LightGray : MidnightGray);
    const HoverColor = hoverColor ?? (darkMode ? HoverDarkMenu : HoverLightMenu)
    const AccentColor = accentColor ??
        (darkMode ?
            (accentColorDarkMode ?? SoftBlue) :
            (accentColorLightMode ?? TrueBlue)
        )
    const XButtonColor = xButtonColor ?? (darkMode ? LightGray : MidnightGray)

    useEffect(() => {
        if (!open) return;
        function handleClick(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);


    //clear search when closed
    useEffect(() => {
        if (!open) setSearchText("");
    }, [open]);

    const keysArray = Array.isArray(selectedKeys)
        ? selectedKeys
        : selectedKeys !== undefined && selectedKeys !== null
            ? [selectedKeys]
            : [];

    function handleSelect(optValue: string | number) {
        if (multiSelect) {
            if (keysArray.includes(optValue)) {
                onChange(keysArray.filter(v => v !== optValue));
            } else {
                onChange([...keysArray, optValue]);
            }
        } else {
            onChange(optValue);
            setOpen(false);
            setSearchText("");
        }
    }



    function handleOnly(optValue: string | number, e: React.MouseEvent) {
        e.stopPropagation();
        onChange([optValue]);
    }



    function handleSelectAllCheckbox() {
        if (multiSelect) {
            if (searchText) {
                if (allMatchesSelected) {
                    // Deselect only matches
                    const withoutMatches = keysArray.filter(val => !filteredVals.includes(val));
                    onChange(withoutMatches);
                } else {
                    // Select all matches (merge with others)
                    const uniqueMatches = distinctValues(keysArray, filteredVals);
                    onChange(uniqueMatches);
                }
            } else if (keysArray.length === options.length) {
                onChange([]); // Deselect all if no search and all selected
            } else {
                onChange(options.map(opt => opt.value)); // Select all if no search
            }
        }
    }

    // Display label logic
    let displayLabel = PlaceHolder;

    if (multiSelect && keysArray.length > 0) {
        const selectedLabels = options
            .filter(opt => keysArray.includes(opt.value))
            .map(opt => opt.label);
        if (selectedLabels.length <= maxDisplaySelect) {
            displayLabel = selectedLabels.join(", ");
        }
        else if (selectedLabels.length === options.length) {
            displayLabel = "All"
        }
        else {
            displayLabel = `${selectedLabels.slice(0, maxDisplaySelect).join(", ")}, +${selectedLabels.length - maxDisplaySelect}`;
        }
    }
    else if (!multiSelect) {
        const selected = options.find(opt => opt.value === keysArray[0]);
        if (selected) displayLabel = selected.label;
    }


    const filteredOptions = options.filter(opt =>
        fuzzyIncludes(opt.label, searchText)
    );

    const filteredVals = filteredOptions.map(x => x.value);
    const allMatchesSelected =
        filteredVals.length > 0 && filteredVals.every(val => keysArray.includes(val));

    const selectAllText =
        searchText
            ? (allMatchesSelected ? "Deselect all matches" : "Select all matches")
            : (allMatchesSelected ? DeselectAllLabel : SelectAllLabel);

    // const allSelected =
    //     multiSelect && keysArray.length > 0 &&
    //     (!searchable ? keysArray.length === options.length : keysArray.length === filteredOptions.length)


    const inputEl = useRef<HTMLInputElement>(null);
    const allowSearch = searchable && open;

    useEffect(() => {
        if (allowSearch) {
            // Let React commit readOnly=false, then focus
            setTimeout(() => inputEl.current?.focus({ preventScroll: true }), 0);
        }
    }, [allowSearch]);

    const handlePointerDownOnInput = (e: React.PointerEvent) => {
        if (disabled) return;
        e.preventDefault();
        toggleOpen();
    };

    return (
        <div
            ref={wrapperRef}
            className={`prizm-ui ${className}`}
            style={{
                ...style,
                position: "relative",
                width: Width,
                minWidth: Width,
                userSelect: "none",
                display: "inline-block",
            }}
        >
            <SearchBox
                label={label}
                backgroundColor={backgroundColor}
                borderColor={MenuBorder}
                xButtonColor={XButtonColor}
                value={allowSearch ? searchText : displayLabel}
                onChange={e => {
                    if (searchable && open) {
                        setSearchText(e.target.value);
                    }
                }}
                // onClick={() => !disabled && setIsOpen(!isOpen)}
                onPointerDown={handlePointerDownOnInput}
                // onTouchEnd={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                readOnly={!allowSearch}
                placeholder={PlaceHolder}
                darkMode={darkMode}
                accentColor={AccentColor}
                style={{
                    width: "100%",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    minWidth: 0,
                }}
                placeholderColor={placeholderColor}
            />
            {open && !disabled && (
                <DropdownMenu
                    style={{
                        position: "absolute",
                        left: 0,
                        top: "100%",
                        width: "100%",
                        background: MenuColor,
                        border: `1px solid ${AccentColor}`,
                        zIndex: 1000,
                        boxSizing: "border-box",
                        borderRadius: 12,
                        overflow: "hidden",
                        maxHeight: maxOptionsHeight,
                        // paddingRight: 25,      
                        overflowY: "auto",
                        color: FontColor
                    }}
                    foregroundColor={FontColor}
                >
                    {multiSelect && showSelectAll && (
                        <DropdownSelectAll
                            checked={allMatchesSelected}
                            label={selectAllText}
                            accentColor={AccentColor}
                            bg={hoverIdx === -1 ? HoverColor : MenuColor}
                            hover={hoverIdx === -1}
                            menuTextColor={AccentColor}
                            darkMode={darkMode}
                            onHover={v => setHoverIdx(v ? -1 : null)}
                            onChange={handleSelectAllCheckbox}
                        />
                    )}
                    {filteredOptions.length === 0 && (
                        <div style={{ padding: "4px 8px", color: fontColor }}>No results</div>
                    )}
                    {filteredOptions.map((opt, i) => (
                        <DropdownOptionRow
                            key={opt.value}
                            option={opt}
                            checked={keysArray.includes(opt.value)}
                            multiSelect={multiSelect}
                            accentColor={AccentColor}
                            hovered={hoverIdx === i}
                            onlyLabel={OnlyLabel}
                            menuTextColor={FontColor}
                            darkMode={darkMode}
                            bg={hoverIdx === i ? HoverColor : MenuColor}
                            onHover={v => setHoverIdx(v ? i : null)}
                            onSelect={() => handleSelect(opt.value)}
                            onOnly={e => handleOnly(opt.value, e)}
                        />
                    ))}
                    {/* <div style={{ width: "100px", minWidth: "8px", height: "1px", float: "right", pointerEvents: "none" }} /> */}
                </DropdownMenu>
            )}
        </div>
    );
};
