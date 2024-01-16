import React, { useMemo, useState } from 'react';
import {
	useTable,
	useSortBy,
	useFilters,
	useGlobalFilter,
	usePagination,
} from 'react-table';

function TableBuilder({ measurements }) {
	//TODO: Export it to a config file?
	const columnData = [
		{
			Header: 'ID',
			accessor: '_id',
			filter: 'fuzzyText',
			show: false,
		},
		{
			Header: 'Created At',
			accessor: 'createdAt',
		},
		{
			Header: 'User ID',
			accessor: 'userId',
			filter: 'fuzzyText',
		},
		{
			Header: 'Fingerprint',
			accessor: 'fingerprint',
			filter: 'fuzzyText',
		},
		{
			Header: 'GPU',
			accessor: 'gpu',
			filter: 'fuzzyText',
		},
		{
			Header: 'OS',
			accessor: 'os',
			Filter: SelectColumnFilter,
			filter: 'includes',
		},
		{
			Header: 'Browser',
			accessor: 'browser',
			filter: 'fuzzyText',
		},
		{
			Header: 'Browser Name',
			accessor: 'browserName',
			Filter: SelectColumnFilter,
			filter: 'includes',
		},
		{
			Header: 'Origin',
			accessor: 'origin',
			Filter: SelectColumnFilter,
			filter: 'includes',
		},
		{
			Header: 'Session ID',
			accessor: 'sessionId',
			filter: 'fuzzyText',
		},
		{
			Header: 'Game ID',
			accessor: 'gameId',
			Filter: SelectColumnFilter,
			filter: 'includes',
		},
		{
			Header: 'Average FPS',
			accessor: 'averageFps',
			Filter: NumberRangeColumnFilter,
			filter: 'between',
		},
		{
			Header: 'Timestamp',
			accessor: 'timestamp',
		},
		{
			Header: 'Session Time',
			accessor: 'sessionTime',
			Filter: NumberRangeColumnFilter,
			filter: 'between',
		},
		{
			Header: 'Room Port',
			accessor: 'roomPort',
			filter: 'fuzzyText',
		},
		{
			Header: 'Game State',
			accessor: 'gameState',
			Filter: SelectColumnFilter,
			filter: 'includes',
		},
		{
			Header: 'Number of Players in Room',
			accessor: 'numberOfPlayersInRoom',
			Filter: NumberRangeColumnFilter,
			filter: 'between',
		},
		{
			Header: 'Number of Friends',
			accessor: 'numberOfFriends',
			Filter: NumberRangeColumnFilter,
			filter: 'between',
		},
		{
			Header: 'Number of Friends Online',
			accessor: 'numberOfFriendsOnline',
			Filter: NumberRangeColumnFilter,
			filter: 'between',
		},
		{
			Header: 'Number of Private Chats',
			accessor: 'numberOfPrivateChats',
			Filter: NumberRangeColumnFilter,
			filter: 'between',
		},
	];

	const _columns = useMemo(() => columnData, []);
	const _data = useMemo(() => measurements, []);

	if (!measurements || measurements.length < 1)
		return <p>no data passed to the table builder</p>;

	return <Table columns={_columns} data={_data} />;
}

function Table({ columns, data }) {
	const filterTypes = React.useMemo(
		() => ({
			// Add a new fuzzyTextFilterFn filter type. Or, override the default text filter to use "startWith".
			fuzzyText: fuzzyTextFilterFn,
			text: (rows, id, filterValue) => {
				return rows.filter(row => {
					const rowValue = row.values[id];
					return rowValue !== undefined
						? String(rowValue)
								.toLowerCase()
								.startsWith(String(filterValue).toLowerCase())
						: true;
				});
			},
		}),
		[]
	);

	const hiddenColumnsAccessors = [
		'_id',
		'userId',
		'fingerprint',
		'gpu',
		'os',
		'browser',
		'sessionId',
		'timestamp',
		'sessionTime',
		'roomPort',
		'numberOfPlayersInRoom',
		'numberOfFriends',
		'numberOfFriendsOnline',
		'numberOfPrivateChats',
	];

	const defaultColumn = React.useMemo(
		() => ({
			Filter: DefaultColumnFilter,
		}),
		[]
	);

	const [columnMenuIsVisible, setColumnMenuIsVisible] = useState(false);

	const {
		headerGroups,
		getTableProps,
		getTableBodyProps,
		page,
		prepareRow,
		flatColumns,
		preGlobalFilteredRows,
		setGlobalFilter,
		getToggleHideAllColumnsProps,
		canPreviousPage,
		canNextPage,
		pageOptions,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		setPageSize,
		state: { pageIndex, pageSize, globalFilter },
	} = useTable(
		{
			columns,
			data,
			initialState: {
				pageIndex: 0,
				hiddenColumns: hiddenColumnsAccessors,
			},
			defaultColumn,
			filterTypes,
		},
		useFilters,
		useGlobalFilter,
		useSortBy,
		usePagination
	);

	function toggleColumnMenuVisibleStatus() {
		setColumnMenuIsVisible(!columnMenuIsVisible);
	}
	// Render the UI for your table
	return (
		<div className='react-table'>
			<div id='table-checkboxes'>
				<div className='table-checkboxes-header'>
					<div className='table-checkboxes-header__title'>customize layout</div>
					<button
						onClick={toggleColumnMenuVisibleStatus}
						className='table-checkboxes-header__button button-narrow button-transparent'
					>
						{columnMenuIsVisible === true ? '▲' : '▼'}
					</button>
				</div>

				{columnMenuIsVisible === true && (
					<div className='table-checkboxes-content'>
						<div className='table-checkboxes-content-checkbox'>
							<IndeterminateCheckbox {...getToggleHideAllColumnsProps()} />{' '}
							Toggle All
						</div>
						{flatColumns.map(column => (
							<div
								className='table-checkboxes-content-checkbox'
								key={column.id}
							>
								<label>
									<input type='checkbox' {...column.getToggleHiddenProps()} />{' '}
									{column.id}
								</label>
							</div>
						))}
						<br />
					</div>
				)}
			</div>

			<div className='react-table-wrapper'>
				<table className='react-table-wrapper__table' {...getTableProps()}>
					<thead>
						{flatColumns.filter(column => column.isVisible === true).length >
							0 && (
							<tr className='global-filter'>
								<th
									colSpan={flatColumns.length}
									style={{
										textAlign: 'left',
									}}
								>
									<GlobalFilter
										preGlobalFilteredRows={preGlobalFilteredRows}
										globalFilter={globalFilter}
										setGlobalFilter={setGlobalFilter}
									/>
								</th>
							</tr>
						)}

						{/* HeaderGroups were not used, but the props were necessary to be fetched for column hiding */}
						{headerGroups.map(headerGroup => (
							<tr {...headerGroup.getHeaderGroupProps()}>
								{headerGroup.headers.map(column => (
									<th {...column.getHeaderProps(column.getSortByToggleProps())}>
										{column.render('Header')}
										{/* Render the columns sort UI */}
										<span>
											{column.isSorted
												? column.isSortedDesc
													? ' ▼'
													: ' ▲'
												: ''}
										</span>
									</th>
								))}
							</tr>
						))}

						{/* Filters are in a seperate tr to prevent the sorting activating on click of the filter */}
						{headerGroups.map(headerGroup => (
							<tr {...headerGroup.getHeaderGroupProps()}>
								{headerGroup.headers.map(column => (
									<th {...column.getHeaderProps()}>
										{/* Render the columns filter UI */}
										<div>
											{column.canFilter ? column.render('Filter') : null}
										</div>
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody {...getTableBodyProps()}>
						{page.map((row, i) => {
							prepareRow(row);
							return (
								<tr {...row.getRowProps()}>
									{row.cells.map(cell => {
										return (
											<td {...cell.getCellProps()}>{cell.render('Cell')}</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>

				<div className='react-table-wrapper__pagination'>
					<div>
						<button
							className='react-table-wrapper__pagination-doubleback button-narrow button-transparent'
							onClick={() => gotoPage(0)}
							disabled={!canPreviousPage}
						>
							{'<<'}
						</button>{' '}
						<button
							className='react-table-wrapper__pagination-back button-narrow button-transparent'
							onClick={() => previousPage()}
							disabled={!canPreviousPage}
						>
							{'<'}
						</button>{' '}
						<button
							className='react-table-wrapper__pagination-forward button-narrow button-transparent'
							onClick={() => nextPage()}
							disabled={!canNextPage}
						>
							{'>'}
						</button>{' '}
						<button
							className='react-table-wrapper__pagination-doubleforward button-narrow button-transparent'
							onClick={() => gotoPage(pageCount - 1)}
							disabled={!canNextPage}
						>
							{'>>'}
						</button>{' '}
					</div>
					<span className='react-table-wrapper__pagination-pagenumbering button-narrow button-transparent'>
						Page{' '}
						<strong>
							{pageIndex + 1} of {pageOptions.length}
						</strong>{' '}
					</span>
					<span className='react-table-wrapper__pagination-gotopage'>
						Go to page:{' '}
						<input
							type='number'
							defaultValue={pageIndex + 1}
							onChange={e => {
								const page = e.target.value ? Number(e.target.value) - 1 : 0;
								gotoPage(page);
							}}
							style={{ width: '100px' }}
						/>
					</span>{' '}
					<select
						className='react-table-wrapper__pagination-pagesize'
						value={pageSize}
						onChange={e => {
							setPageSize(Number(e.target.value));
						}}
					>
						{[10, 20, 30, 40, 50].map(pageSize => (
							<option key={pageSize} value={pageSize}>
								Show {pageSize}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}

// Define a default UI for filtering
function GlobalFilter({
	preGlobalFilteredRows,
	globalFilter,
	setGlobalFilter,
}) {
	const count = preGlobalFilteredRows.length;

	return (
		<span>
			Search:{' '}
			<input
				value={globalFilter || ''}
				onChange={e => {
					setGlobalFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
				}}
				placeholder={`${count} records...`}
				style={{
					fontSize: '1.1rem',
					border: '0',
				}}
			/>
		</span>
	);
}

/** Define a default UI for filtering */

function DefaultColumnFilter({
	column: { filterValue, preFilteredRows, setFilter },
}) {
	const count = preFilteredRows.length;

	return (
		<input
			value={filterValue || ''}
			onChange={e => {
				setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
			}}
			placeholder={`Search ${count} records...`}
		/>
	);
}

function fuzzyTextFilterFn(rows, id, filterValue) {
	return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val;

/**
 * This is a custom filter UI for selecting a unique option from a list
 */
function SelectColumnFilter({
	column: { filterValue, setFilter, preFilteredRows, id },
}) {
	// Calculate the options for filtering
	// using the preFilteredRows
	const options = React.useMemo(() => {
		const options = new Set();
		preFilteredRows.forEach(row => {
			options.add(row.values[id]);
		});
		return [...options.values()];
	}, [id, preFilteredRows]);

	// Render a multi-select box
	return (
		<select
			value={filterValue}
			onChange={e => {
				setFilter(e.target.value || undefined);
			}}
		>
			<option value=''>All</option>
			{options.map((option, i) => (
				<option key={i} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}

/**
 * This is a custom UI for our 'between' or number range filter. It uses two number boxes and filters rows to ones that have values between the two
 */

function NumberRangeColumnFilter({
	column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
	const [min, max] = React.useMemo(() => {
		let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		preFilteredRows.forEach(row => {
			min = Math.min(row.values[id], min).toFixed(1);
			max = Math.max(row.values[id], max).toFixed(1);
		});
		return [min, max];
	}, [id, preFilteredRows]);

	return (
		<div
			style={{
				display: 'flex',
			}}
		>
			<input
				value={filterValue[0] || ''}
				type='number'
				onChange={e => {
					const val = e.target.value;
					setFilter((old = []) => [
						val ? parseInt(val, 10) : undefined,
						old[1],
					]);
				}}
				placeholder={`Min (${min})`}
				style={{
					width: '70px',
					marginRight: '0.5rem',
				}}
			/>
			<input
				value={filterValue[1] || ''}
				type='number'
				onChange={e => {
					const val = e.target.value;
					setFilter((old = []) => [
						old[0],
						val ? parseInt(val, 10) : undefined,
					]);
				}}
				placeholder={`Max (${max})`}
				style={{
					width: '70px',
					marginLeft: '0.5rem',
				}}
			/>
		</div>
	);
}

const IndeterminateCheckbox = React.forwardRef(
	({ indeterminate, ...rest }, ref) => {
		const defaultRef = React.useRef();
		const resolvedRef = ref || defaultRef;

		React.useEffect(() => {
			resolvedRef.current.indeterminate = indeterminate;
		}, [resolvedRef, indeterminate]);

		return <input type='checkbox' ref={resolvedRef} {...rest} />;
	}
);

export default TableBuilder;
