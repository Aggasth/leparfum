# Tabla de carga de datos desde alguna /api/name

<% if (saleInfo === 0) { %>

<tr>
<td colspan="6">Error en la carga</td>
</tr>
<% } else { %>
<% saleInfo.forEach((sale, index) => { %>
<tr>
<th scope="row"><%= index + 1 %></th>
<td><img src="<%= sale.product.imagen %>" alt="" width="50"></td>
<td><%= sale.product.nombreProducto %></td>
<td>$<%= sale.product.precio %></td>
<td>Cantidad: <%= sale.quantity %></td>
<td>
<button type="button" class="btn ">
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30">
<path d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z"></path>
</svg>
</button>
</td>
</tr>
<% }); %>
<% } %>
